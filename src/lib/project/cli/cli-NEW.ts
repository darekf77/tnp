//#region imports
import { config } from 'tnp-core/src';
import { notAllowedProjectNames } from 'tnp-core/src';
import {
  CoreModels,
  _,
  chalk,
  crossPlatformPath,
  os,
  path,
} from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  DEFAULT_FRAMEWORK_VERSION,
  MESSAGES,
  TEMP_DOCS,
} from '../../constants';
import { Models } from '../../models';
import { EnvOptions } from '../../options';
import { Project } from '../abstract/project';
import { TaonJson } from '../abstract/taonJson';

import { BaseCli } from './base-cli';
//#endregion

export class $New extends BaseCli {
  public async _(): Promise<void> {
    await this._createContainersOrStandalone({
      name: this.firstArg,
      cwd: this.cwd,
    });

    this._exit();
  }

  //#region init containers
  private async _initContainersAndApps(
    cwd: string,
    nameFromArgs: string,
  ): Promise<{
    containers: Project[];
    firstContainer: Project;
    lastContainer: Project;
    lastIsBrandNew: boolean;
    appProj: Project;
    containersAndProjFromArgName: string[];
    preOrgs: string;
    initGit: boolean;
  }> {
    //#region resolve variables

    nameFromArgs = nameFromArgs.replace('./', '');
    nameFromArgs = nameFromArgs.replace('.\\', '');
    nameFromArgs = nameFromArgs.replace(/\/$/, '');
    nameFromArgs = nameFromArgs.replace(/\\$/, '');
    nameFromArgs = nameFromArgs.replace(/\\$/g, '/');
    const orgArgName = nameFromArgs;
    const shouldBeOrganization = (containerName: string): boolean => {
      return !_.isUndefined(
        orgArgName.split('/').find(f => {
          return f.includes('@') || f.replace('@', '') === containerName;
        }),
      );
    };

    nameFromArgs = nameFromArgs.replace(/\@/g, '');

    /**
     * examples:
     * my-app
     * my-org/my-app
     * my-big-org/my-smaller-org/my-app
     * ..
     */
    const allProjectFromArgs = nameFromArgs.includes('/')
      ? nameFromArgs.split('/')
      : [nameFromArgs];

    const hasAutoCreateNormalContainersFromArgs = allProjectFromArgs.length > 2;
    const hasAtLeastOneContainersFromArgs = allProjectFromArgs.length > 1;

    // app OR org/app
    const standaloneOrOrgWithStanalonePathName = crossPlatformPath([
      path.basename(path.dirname(allProjectFromArgs.join('/'))),
      path.basename(allProjectFromArgs.join('/')),
    ]);

    // additional auto created normal containers
    const autoCreateNormalContainersPathName = (
      hasAutoCreateNormalContainersFromArgs
        ? allProjectFromArgs
            .join('/')
            .replace(standaloneOrOrgWithStanalonePathName, '')
        : ''
    ).replace(/\/$/, '');

    const lastProjectFromArgName =
      allProjectFromArgs.length > 0
        ? _.last(allProjectFromArgs) // last org proj
        : _.first(allProjectFromArgs); // standalone proj

    //#endregion

    // debugger;

    //#region check if name is allowed
    const notAllowedNameForApp = notAllowedProjectNames.find(
      a => a === lastProjectFromArgName,
    );

    if (!!notAllowedNameForApp) {
      Helpers.error(
        `

       Name ${chalk.bold(notAllowedNameForApp)} is not allowed.

       Use different name: ${chalk.bold(
         crossPlatformPath(allProjectFromArgs.join('/')).replace(
           notAllowedNameForApp,
           'my-app-or-something-else',
         ),
       )}

       `,
        false,
        true,
      );
    }
    //#endregion

    let firstContainer: Project;
    let lastContainer: Project;
    let lastIsBrandNew = false;

    const grandpa = Project.ins.From(cwd) as Project;
    const containers: Project[] = [
      ...(grandpa && grandpa.framework.isContainer ? [grandpa] : []),
    ];

    if (hasAtLeastOneContainersFromArgs) {
      const foldersToRecreate = _.cloneDeep(allProjectFromArgs).slice(
        0,
        allProjectFromArgs.length - 1,
      );
      let tmpCwd = cwd;
      let parentContainer = Project.ins.From(cwd) as Project;
      let currentContainer: Project;
      do {
        const folder = foldersToRecreate.shift();
        const isLastContainer = foldersToRecreate.length === 0;
        const currentContainerPath = path.join(tmpCwd, folder);
        const isBrandNew = !Helpers.exists(currentContainerPath);
        if (isBrandNew) {
          Helpers.mkdirp(currentContainerPath);
        }
        const packageJsonPath = path.join(
          currentContainerPath,
          config.file.package_json,
        );

        const taonJsoncPath = path.join(
          currentContainerPath,
          config.file.taon_jsonc,
        );

        if (!Helpers.exists(packageJsonPath)) {
          Helpers.writeJson(packageJsonPath, {
            name: path.basename(currentContainerPath),
            version: '0.0.0',
          } as PackageJson);

          Helpers.writeJson(taonJsoncPath, {
            version: DEFAULT_FRAMEWORK_VERSION,
            type: 'container' as any,
            monorepo: true,
            organization: shouldBeOrganization(
              path.basename(path.dirname(taonJsoncPath)),
            ),
          } as Partial<Models.TaonJsonContainer>);
        }

        currentContainer = Project.ins.From(currentContainerPath) as Project;
        containers.push(currentContainer);

        if (parentContainer?.framework.isContainer) {
          parentContainer.linkedProjects.addLinkedProject(
            path.basename(currentContainer.location),
          );
        }
        parentContainer = currentContainer;

        if (
          isLastContainer &&
          isBrandNew &&
          !parentContainer &&
          !currentContainer.git.isInsideGitRepo
        ) {
          try {
            currentContainer.run('git init').sync();
            try {
              if (currentContainer.git.currentBranchName !== 'master') {
                currentContainer.run('git checkout -b master').sync();
              }
            } catch (error) {}
          } catch (error) {
            Helpers.warn(
              `Not able to init git inside container: ${currentContainer?.location}`,
            );
          }
        }

        if (!firstContainer) {
          firstContainer = currentContainer;
        }

        if (isLastContainer) {
          lastContainer = currentContainer;
        }
        if (isLastContainer && isBrandNew) {
          lastIsBrandNew = true;
        }

        tmpCwd = currentContainerPath;
      } while (foldersToRecreate.length > 0);
    }

    //#region init create standalone project or container child
    let appProj: Project;

    const appLocation = lastContainer
      ? crossPlatformPath([lastContainer?.location, lastProjectFromArgName])
      : crossPlatformPath([cwd, lastProjectFromArgName]);

    const packageJson = new BasePackageJson({
      cwd: crossPlatformPath([appLocation, config.file.package_json]),
      defaultValue: {},
    });

    packageJson.setIsPrivate(true);
    packageJson.setVersion('0.0.0');
    packageJson.setName(path.basename(lastProjectFromArgName));

    const taonJson = new TaonJson(Project.ins.From(packageJson.cwd), {});
    taonJson.setType('isomorphic-lib');
    taonJson.setFrameworkVersion(DEFAULT_FRAMEWORK_VERSION);
    taonJson.overridePackageJsonManager.setIsPrivate(true);

    Project.ins.unload(appLocation);
    appProj = Project.ins.From(appLocation) as Project;
    if (!hasAtLeastOneContainersFromArgs) {
      lastContainer = appProj.parent;
    }
    let initGit = true;
    if (lastContainer?.framework?.isContainer && lastContainer.isMonorepo) {
      initGit = false;
      Helpers.info(
        `Not initing git since ${path.basename(appLocation)} is inside container monorepo`,
      );
    }

    if (Helpers.git.isInsideGitRepo(appLocation)) {
      initGit = false;
      Helpers.info(
        `Not initing git since ${path.basename(appLocation)} is inside git repo`,
      );
    }

    if (initGit) {
      try {
        appProj.run('git init').sync();
      } catch (error) {
        initGit = false;
        console.log(error);
        Helpers.warn(`Not able to init git inside: ${appProj.location}`);
      }
    }
    if (initGit) {
      // if(Helpers.git.)
      try {
        appProj.run('git add --all . && git commit -m "first"').sync();
      } catch (error) {
        initGit = false;
        console.log(error);
        Helpers.warn(
          `Not add "first" commit inside repository: ${appProj.location}`,
        );
      }
    }

    if (initGit) {
      try {
        if (appProj.git.currentBranchName !== 'master') {
          appProj.run('git checkout -b master').sync();
        }
      } catch (error) {}
    }

    appProj.artifactsManager.globalHelper.addSrcFolderFromCoreProject();
    //#endregion

    // console.log({

    //   appProj,
    // });

    if (lastContainer) {
      lastContainer.taonJson.setType('container');
    }

    await appProj.init(
      this.params.clone({
        purpose: 'initing new app',
      }),
    );

    if (lastContainer) {
      lastContainer.linkedProjects.addLinkedProject(lastProjectFromArgName);
    }

    appProj.vsCodeHelpers.toogleFilesVisibilityInVscode({
      action: 'hide-files',
    });

    if (initGit) {
      try {
        appProj
          .run('git add --all . && git commit -m "chore: initial structure"')
          .sync();
      } catch (error) {
        console.log(error);
        Helpers.warn(`Not able to init git inside: ${appProj.location}`);
      }
    }

    if (appProj.git.isGitRoot) {
      try {
        this._addRemoteToStandalone(appProj);
      } catch (error) {}
    }

    return {
      containers,
      firstContainer,
      lastContainer,
      lastIsBrandNew,
      appProj,
      containersAndProjFromArgName: allProjectFromArgs,
      preOrgs: autoCreateNormalContainersPathName,
      initGit,
    };
  }
  //#endregion

  //#region add remote to sta1ndalone
  private _addRemoteToStandalone(appProj: Project): void {
    if (appProj.framework.isStandaloneProject) {
      const lastContainer = appProj.parent;
      const ADDRESS_GITHUB_SSH_PARENT = lastContainer?.git?.originURL;
      const newRemote =
        ADDRESS_GITHUB_SSH_PARENT &&
        ADDRESS_GITHUB_SSH_PARENT?.replace(
          `${lastContainer.name}.git`,
          `${appProj.name}.git`,
        );
      if (newRemote) {
        try {
          appProj
            .run('git remote add origin ' + newRemote, {
              output: false,
              silence: true,
            })
            .sync();
        } catch (error) {}
      }
    }
  }
  //#endregion

  //#region create container or standalone
  public async _createContainersOrStandalone(
    options: Models.NewSiteOptions,
  ): Promise<void> {
    let { name: nameFromArgs, cwd } = options;
    const { appProj, containers, lastContainer, lastIsBrandNew, initGit } =
      await this._initContainersAndApps(cwd, nameFromArgs);

    Helpers.writeFile(
      [appProj.location, 'README.md'],
      `# ${appProj.name}

Hello from Standalone Project

       `,
    );

    if (initGit) {
      try {
        appProj
          .run(`git add --all . && git commit -m "docs: README.md update"`)
          .sync();
      } catch (error) {}
    }

    if (lastIsBrandNew) {
      lastContainer.writeFile(
        'README.md',
        `# @${lastContainer.name}

Hello from Container Project

       `,
      );
    }

    for (let index = 0; index < containers.length; index++) {
      const container = containers[index];

      await container.init(
        this.params.clone({
          purpose: 'initing new container',
        }),
      );
      await container.vsCodeHelpers.init();
    }

    Helpers.info(`DONE CREATING ${nameFromArgs}`);
  }
  //#endregion
}

export default {
  $New: Helpers.CLIWRAP($New, '$New'),
};
