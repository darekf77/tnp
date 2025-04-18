//#region imports
import { config } from 'tnp-config/src';
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

import { MESSAGES, TEMP_DOCS, notAllowedProjectNames } from '../../constants';
import { Models } from '../../models';
import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';
import { TaonJson } from '../abstract/taonJson';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class $New extends BaseCli {


  public async _() {
    await this._containerStandaloneFromArgs(this.args.join(' '));
  }

  //#region error messages
  private _errorMsgCreateProject() {
    Helpers.log(chalk.green(`Good examples:`));
    Helpers.log(
      `\t${chalk.gray(`${config.frameworkName} new`)} ${chalk.gray(
        'mySuperLib',
      )}`,
    );
    Helpers.error(chalk.red(`Please use example above.`), false, true);
  }
  //#endregion

  //#region fix options
  private _fixOptions_create(options: Models.NewSiteOptions) {
    if (_.isNil(options)) {
      options = {} as any;
    }

    if (_.isNil(options.version)) {
      options.version = config.defaultFrameworkVersion; // OK
    }

    if (_.isNil(options.skipInit)) {
      options.skipInit = true;
    }

    if (!_.isArray(options.alsoBasedOn)) {
      options.alsoBasedOn = [];
    }

    return options;
  }
  //#endregion

  //#region container / standalone
  public async _containerStandaloneFromArgs(args: string) {
    const argv = args.split(' ');

    if (!_.isArray(argv) || argv.length < 1) {
      Helpers.error(
        `Top few argument for ${chalk.black('init')} parameter.`,
        true,
      );
      this._errorMsgCreateProject();
    }
    const {
      basedOn,
      version,
      skipInit,
    }: {
      basedOn: string;
      version: CoreModels.FrameworkVersion;
      skipInit?: boolean;
    } = require('minimist')(args.split(' '));

    // if (basedOn) {
    //   Helpers.error(`To create workspace site use command: `
    //     + `${config.frameworkName} new: site name - of - workspace - site`
    //     + `--basedOn relativePathToBaselineWorkspace`, false, true);
    // }
    const type = 'isomorphic-lib' as any;
    const name = argv[0];

    await this._createContainersOrStandalone({
      type,
      name,
      cwd: this.cwd,
      basedOn: void 0,
      version:
        _.isString(version) && version.startsWith('v') ? version : void 0,
      skipInit,
    });

    this._exit();
  }
  //#endregion

  //#region add remote to standalone
  private _addRemoteToStandalone(appProj: Project) {
    if (appProj.framework.isStandaloneProject) {
      const lastContainer = appProj.parent;
      const ADDRESS_GITHUB_SSH_PARENT = lastContainer?.git?.originURL;
      const newRemote = ADDRESS_GITHUB_SSH_PARENT?.replace(
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
          appProj
            .run('git add --all . && git commit -m "first"', {
              output: false,
              silence: true,
            })
            .sync();
        } catch (error) {}
      }
    }
  }
  //#endregion

  //#region init containers
  private async _initContainersAndApps(
    cwd: string,
    nameFromArgs: string,
    version: CoreModels.FrameworkVersion,
  ) {
    nameFromArgs = nameFromArgs.replace('./', '');
    nameFromArgs = nameFromArgs.replace('.\\', '');
    nameFromArgs = nameFromArgs.replace(/\/$/, '');
    nameFromArgs = nameFromArgs.replace(/\\$/, '');
    nameFromArgs = nameFromArgs.replace(/\\$/g, '/');

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

    const notAllowedNameForApp = notAllowedProjectNames.find(
      a => a === lastProjectFromArgName,
    );
    if (!!notAllowedNameForApp) {
      Helpers.error(
        `

       Name ${chalk.bold(notAllowedNameForApp)} is not allowed.

       Use different name: ${chalk.bold(
         crossPlatformPath(path.dirname(allProjectFromArgs.join('/'))).replace(
           notAllowedNameForApp,
           'my-app-or-something-else',
         ),
       )}

       `,
        false,
        true,
      );
    }

    let firstContainer: Project;
    let lastContainer: Project;
    let lastIsBrandNew = false;

    const grandpa = this.ins.From(cwd) as Project;
    const containers: Project[] = [
      ...(grandpa && grandpa.framework.isContainer ? [grandpa] : []),
    ];

    if (hasAtLeastOneContainersFromArgs) {
      const foldersToRecreate = _.cloneDeep(allProjectFromArgs).slice(
        0,
        allProjectFromArgs.length - 1,
      );
      let tmpCwd = cwd;
      let parentContainer = this.ins.From(cwd) as Project;
      let currentContainer: Project;
      do {
        const folder = foldersToRecreate.shift();
        const isLastContainer = foldersToRecreate.length === 0;
        const currentContainerPath = path.join(tmpCwd, folder);
        // console.log(`

        // RUN for ${currentContainerPath}

        // `)
        const isBrandNew = !Helpers.exists(currentContainerPath);
        if (isBrandNew) {
          Helpers.mkdirp(currentContainerPath);
        }
        const packageJsonPath = path.join(
          currentContainerPath,
          config.file.package_json,
        );

        let monorepo = false;
        if (!Helpers.exists(packageJsonPath)) {
          if (isLastContainer && isBrandNew && !parentContainer) {
            const displayNameForLastContainerBeforeApp =
              hasAtLeastOneContainersFromArgs
                ? chalk.italic(
                    `${
                      autoCreateNormalContainersPathName
                        ? autoCreateNormalContainersPathName + '/'
                        : ''
                    }`,
                  ) +
                  `${chalk.italic.red(
                    path.basename(
                      path.dirname(standaloneOrOrgWithStanalonePathName),
                    ),
                  )}` +
                  chalk.italic(`/${lastProjectFromArgName}`)
                : chalk.italic(standaloneOrOrgWithStanalonePathName);

            Helpers.info(`

 ${chalk.bold(
   'SMART CONTAINERS',
 )} - can be used to publish npm organization packages ex. @org/package-name
 ${chalk.bold(
   'NORMAL CONTAINERS',
 )} - are just a wrapper for other project for easy
 git pull/push or children packages release. Normal container can wrap "standalone" or "smart container" projects.

             `);

            monorepo = await Helpers.questionYesNo(
              `Do you want container ${displayNameForLastContainerBeforeApp} be monorepo ?`,
            );
          }
          const smartContainerBuildTarget =
            hasAtLeastOneContainersFromArgs &&
            path.basename(currentContainerPath) ===
              _.first(lastProjectFromArgName.split('/'))
              ? lastProjectFromArgName
              : void 0;

          Helpers.writeJson(packageJsonPath, {
            name: path.basename(currentContainerPath),
            version: '0.0.0',
            private: true,
            tnp: {
              version: version || config.defaultFrameworkVersion,
              type: 'container',
              monorepo,
              smartContainerBuildTarget,
            },
          } as PackageJson);
        }

        currentContainer = this.ins.From(currentContainerPath) as Project;
        containers.push(currentContainer);

        if (parentContainer?.framework.isContainer) {
          parentContainer.linkedProjects.addLinkedProject(
            path.basename(currentContainer.location),
          );
        }
        parentContainer = currentContainer;

        if (isLastContainer && isBrandNew && !parentContainer) {
          try {
            currentContainer.run('git init').sync();
          } catch (error) {
            Helpers.warn(
              `Not able to git init inside: ${currentContainer?.location}`,
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

    const taonJson = new TaonJson(this.project.ins.From(packageJson.cwd), {});
    taonJson.setType('isomorphic-lib');
    taonJson.setFrameworkVersion(version || config.defaultFrameworkVersion);
    taonJson.overridePackageJsonManager.setIsPrivate(true);

    appProj = this.ins.From(appLocation) as Project;
    if (!hasAtLeastOneContainersFromArgs) {
      lastContainer = appProj.parent;
    }
    if (
      lastContainer &&
      lastContainer.framework.isContainer &&
      !lastContainer.isMonorepo
    ) {
      try {
        if (!appProj.parent?.isMonorepo) {
          appProj.run('git init').sync();
        }
      } catch (error) {
        console.log(error);
        Helpers.warn(`Not able to git init inside: ${appProj.location}`);
      }
    }
    appProj.artifactsManager.globalHelper.__addSourcesFromCore();

    // console.log({

    //   appProj,
    // });

    if (lastContainer) {
      lastContainer.taonJson.setType('container');
    }

    await appProj.init(
      EnvOptions.from({
        purpose: 'initing new app',
      }),
    );

    appProj.artifactsManager.globalHelper.__replaceSourceForStandalone();

    if (lastContainer) {
      lastContainer.linkedProjects.addLinkedProject(lastProjectFromArgName);
    }

    appProj.artifactsManager.artifact.npmLibAndCliTool.filesRecreator.vscode.settings.hideOrShowFilesInVscode(
      true,
    );

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
    };
  }
  //#endregion

  //#region create container or standalone
  public async _createContainersOrStandalone(options: Models.NewSiteOptions) {
    let { name: nameFromArgs, cwd, version } = this._fixOptions_create(options);
    const { appProj, containers, lastContainer, lastIsBrandNew } =
      await this._initContainersAndApps(cwd, nameFromArgs, version);

    Helpers.writeFile(
      [appProj.location, 'README.md'],
      `#  ${appProj.name}

       I am standalone project.
       `,
    );

    if (lastIsBrandNew) {
      lastContainer.writeFile(
        'README.md',
        `# @${lastContainer.name}

       This smart container is perfect for publishing organizaiton npm pacakges

       `,
      );
    }

    for (let index = 0; index < containers.length; index++) {
      const container = containers[index];

      await container.init(
        EnvOptions.from({
          purpose: 'initing new container',
        }),
      );
      container.artifactsManager.artifact.npmLibAndCliTool.filesRecreator.initVscode();
    }

    Helpers.info(`DONE CREATING ${nameFromArgs}`);
    //     Helpers.info(`

    //     DONE CREATING ${containersAndProjFromArgName.join('/')}

    // ${chalk.green('To start developing taon\'s backend/frontend apps/libs execute command:')}

    // cd ${preOrgs + '/' + (cleanDisplaName.includes('/') ? _.first(cleanDisplaName.split('/')) : cleanDisplaName)
    //       } && taon start ${_.last(containersAndProjFromArgName)} --websql

    //     `);
  }
  //#endregion
}

export default {
  $New: Helpers.CLIWRAP($New, '$New'),
};
