//#region imports
import {
  config,
  LibTypeEnum,
  UtilsFilesFoldersSync,
  UtilsTempFolder,
  UtilsTerminal,
} from 'tnp-core/src';
import { notAllowedProjectNames } from 'tnp-core/src';
import {
  CoreModels,
  _,
  chalk,
  crossPlatformPath,
  os,
  path,
} from 'tnp-core/src';
import {
  BasePackageJson,
  Helpers,
  HelpersTaon,
  UtilsNpm,
  UtilsVSCode,
} from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  DEFAULT_FRAMEWORK_VERSION,
  MESSAGES,
  packageJsonMainProject,
  readmeMdMainProject,
  taonJsonMainProject,
  TEMP_DOCS,
} from '../../constants';
import { Models } from '../../models';
import { EnvOptions, ReleaseArtifactTaon, ReleaseType } from '../../options';
import { Project } from '../abstract/project';
import { TaonJson } from '../abstract/taonJson';

import { BaseCli } from './base-cli';
import { MagicRenamer, RenameRule } from 'magic-renamer/src';
//#endregion

export class $New extends BaseCli {
  public async _(): Promise<void> {
    await this._createContainersOrStandalone({
      name: this.firstArg,
      cwd: this.cwd,
      force: !!this.params['force'],
      type: this.params['template']
        ? this.params['template']
        : this.params['docs']
          ? 'docs'
          : this.params['baseline']
            ? 'baseline'
            : 'default',
    });

    this._exit();
  }

  //#region open
  async open() {
    const appName = await this._createContainersOrStandalone({
      name: this.firstArg,
      cwd: this.cwd,
      force: !!this.params['force'],
      type: this.params['template']
        ? this.params['template']
        : this.params['docs']
          ? 'docs'
          : this.params['baseline']
            ? 'baseline'
            : 'default',
    });
    UtilsVSCode.openFolder(crossPlatformPath([this.cwd, appName]));
    this._exit();
  }
  //#endregion

  //#region init containers
  private async _initContainersAndApps(
    cwd: string,
    nameFromArgs: string,
    force: boolean,
    projType?: Models.NewSiteType,
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
    //#region @backendFunc
    //#region resolve variables

    nameFromArgs = nameFromArgs.replace('./', '');
    nameFromArgs = nameFromArgs.replace('.\\', '');
    nameFromArgs = nameFromArgs.replace(/\/$/, '');
    nameFromArgs = nameFromArgs.replace(/\\$/, '');
    nameFromArgs = nameFromArgs.replace(/\\$/g, '/');
    const orgArgName = nameFromArgs;
    const shouldBeOrganization = (containerName: string): boolean => {
      // console.log(`Checking if ${containerName} should be organization`);

      const shouldBeOrg = !_.isUndefined(
        orgArgName.split('/').find(f => {
          return f.includes('@') && f.replace('@', '') === containerName;
        }),
      );

      if (shouldBeOrg) {
        Helpers.info(
          `Container: ${containerName} will be mark as organization container`,
        );
      }

      // console.log({ orgArgName, containerName, shouldBeOrg });
      return shouldBeOrg;
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

    const coreContainer = Project.ins.by('container');
    // console.log({ force });
    const alreadyTaken = coreContainer.nodeModules.getAllPackagesNames({
      followSymlinks: false,
    });

    if (alreadyTaken.includes(lastProjectFromArgName) && !force) {
      const versionInNpm = await UtilsNpm.getLastMajorVersions(
        lastProjectFromArgName,
      );
      const isIsomorphic = coreContainer.nodeModules.checkIsomorphic(
        lastProjectFromArgName,
      );

      //#region error message
      const displayErrorMesage = () => {
        Helpers.error(
          `

           Name ${chalk.bold(lastProjectFromArgName)} is already taken.

           ${'- ' + coreContainer?.nodeModules?.pathFor(lastProjectFromArgName)}
           ${
             this.project?.taonJson?.isUsingOwnNodeModulesInsteadCoreContainer
               ? '- ' +
                 this.project?.nodeModules?.pathFor(lastProjectFromArgName)
               : ''
           }

           Use different name or add prefix: ${chalk.bold(
             crossPlatformPath(allProjectFromArgs.join('/')).replace(
               lastProjectFromArgName,
               'my-app-or-something-else',
             ),
           )}

           `,
          false,
          true,
        );
      };
      //#endregion

      if (versionInNpm.length === 0 && !isIsomorphic) {
        //#region ask user to remove faulty package
        Helpers.info(`
          Package ${chalk.bold(lastProjectFromArgName)} does not look like proper pacakge.
          - is not isomorphic
          - is not in public npm

          `);
        const removePackage = await UtilsTerminal.confirm({
          message: `Would you like to remove it from core container(s) and use it name?`,
          defaultValue: true,
        });
        //#endregion

        if (removePackage) {
          coreContainer.nodeModules.removePackage(lastProjectFromArgName);
          if (this.project.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
            this.project.nodeModules.removePackage(lastProjectFromArgName);
          }
        } else {
          displayErrorMesage();
        }
      } else {
        displayErrorMesage();
      }
    }

    if (notAllowedProjectNames.includes(lastProjectFromArgName) && !force) {
      Helpers.error(
        `

       Name ${chalk.bold(lastProjectFromArgName)} is not allowed.

       Use different name: ${chalk.bold(
         crossPlatformPath(allProjectFromArgs.join('/')).replace(
           lastProjectFromArgName,
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
          packageJsonMainProject,
        );

        const taonJsoncPath = path.join(
          currentContainerPath,
          taonJsonMainProject,
        );

        if (!Helpers.exists(packageJsonPath)) {
          Helpers.writeJson(packageJsonPath, {
            name: path.basename(currentContainerPath),
            version: `${coreContainer.taonJson.frameworkVersion.replace('v', '')}.0.0`,
          } as PackageJson);

          Helpers.writeJson(taonJsoncPath, {
            version: DEFAULT_FRAMEWORK_VERSION,
            type: LibTypeEnum.CONTAINER,
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
      cwd: crossPlatformPath([appLocation, packageJsonMainProject]),
      defaultValue: {},
    });

    packageJson.setIsPrivate(true);
    packageJson.setVersion(
      `${coreContainer.taonJson.frameworkVersion.replace('v', '')}.0.0`,
    );
    await packageJson.setName(path.basename(lastProjectFromArgName));

    const taonJson = new TaonJson(Project.ins.From(packageJson.cwd), {});
    taonJson.setType(LibTypeEnum.ISOMORPHIC_LIB);
    await taonJson.setFrameworkVersion(DEFAULT_FRAMEWORK_VERSION);
    taonJson.overridePackageJsonManager.setIsPrivate(true);
    // taonJson.shouldGenerateAutogenAppRoutesFile = true;
    taonJson.setShouldGenerateAutogenIndexFile(true);
    taonJson.setShouldGenerateTranslationsFiles(true);
    taonJson.setShouldGenerateAutogenAppRoutes(true);

    taonJson.autoReleaseConfigAllowedItems =
      Project.ins.by('isomorphic-lib').taonJson.autoReleaseConfigAllowedItems;

    Project.ins.unload(appLocation);
    appProj = Project.ins.From(appLocation) as Project;

    if (projType) {
      if (projType === 'docs') {
        projType = 'baseline-docs' as any;
      }

      if (projType !== 'baseline' && projType !== 'baseline-docs') {
        projType = void 0;
      } else {
        await this._cloneRepoAndApplyTo(projType as any, appProj);
      }
    }

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

    if (HelpersTaon.git.isInsideGitRepo(appLocation)) {
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
      // if(HelpersTaon.git.)
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

    if (!projType) {
      appProj.artifactsManager.globalHelper.addSrcFolderFromCoreProject();
    }

    //#endregion

    // console.log({

    //   appProj,
    // });

    if (lastContainer) {
      lastContainer.taonJson.setType(LibTypeEnum.CONTAINER);
    }

    await appProj.init(
      this.params.clone({
        purpose: 'initing new app',
        release: {
          targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        },
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
    //#endregion
  }
  //#endregion

  //#region clone repo and apply to src
  private async _cloneRepoAndApplyTo(
    repoBasename: 'baseline' | 'baseline-docs',
    project: Project,
  ) {
    //#region @backendFunc

    const repoRoot = UtilsTempFolder.getPathForNodeOnly({
      prefix: 'taon-cloned-for-new-templates',
      deleteAfterDays: 1,
    });
    const repoUrl = `https://github.com/taon-dev/${repoBasename}.git`;

    await HelpersTaon.git.clone({
      cwd: repoRoot,
      url: repoUrl,
      override: true,
      destinationFolderName: repoBasename,
    });

    const clonedBaselineProj = project.ins.From([repoRoot, repoBasename]);

    project.removeFolderByRelativePath('src');

    UtilsFilesFoldersSync.copy(
      clonedBaselineProj.pathFor('src'),
      project.pathFor('src'),
      {
        recursive: true,
        overwrite: true,
        copySymlinksAsFiles: false,
      },
    );
    Helpers.info(`

      CLONED ${crossPlatformPath([repoRoot, repoBasename])}

      `);
    // Helpers.remove([repoRoot, repoBasename]);

    if (repoBasename === 'baseline-docs') {
      project.removeFolderByRelativePath(
        'src/lib/generated-docs-from-md-files',
      );
      project.taonJson.setShouldGenerateDocsComponents(true);
    }
    if (repoBasename === 'baseline') {
      UtilsFilesFoldersSync.copyFile(
        clonedBaselineProj.pathFor('env.ts'),
        project.pathFor('env.ts'),
      );
    }

    //#region folders to rename
    const folderToRename =
      repoBasename === 'baseline'
        ? [
            project.pathFor('src/lib/taon-baseline'),
            project.pathFor('src/lib/taon-baseline-backoffice'),
          ]
        : [project.pathFor('src/lib/docs-page')];
    for (let index = 0; index < folderToRename.length; index++) {
      const folder = folderToRename[index];
      const ins = MagicRenamer.Instance(folder);
      const ruleFrom =
        repoBasename === 'baseline' ? `taon-baseline` : 'docs-page';

      await ins.start(`${ruleFrom} => ${project.name}`);

      const revertNames =
        repoBasename === 'baseline'
          ? ['BackofficeOutletName']
          : ['PageComponent'];

      for (let revertName of revertNames) {
        const files = [
          ...UtilsFilesFoldersSync.getFilesFrom(
            project.pathFor(`src/lib/${project.name}`),
          ),
          ...UtilsFilesFoldersSync.getFilesFrom(
            project.pathFor(`src/lib/${project.name}-backoffice`),
          ),
        ];
        files.forEach(f => {
          let content = UtilsFilesFoldersSync.readFile(f);

          const toReplace =
            `${repoBasename === 'baseline-docs' ? 'Taon' : ''}` +
            `${_.upperFirst(_.camelCase(ruleFrom))}${revertName}`;

          if (repoBasename === 'baseline-docs') {
            revertName = revertName.replace('Page', '');
          }

          const fromReplace =
            `${repoBasename === 'baseline-docs' ? 'Taon' : ''}` +
            `${_.upperFirst(_.camelCase(project.name))}${revertName}`;

          content = content.replaceAll(fromReplace, toReplace);

          if (repoBasename === 'baseline-docs') {
            content = content.replace(
              new RegExp(`${repoBasename}`, 'g'),
              `${project.name}`,
            );
            content = content.replace(
              new RegExp(_.upperFirst(_.camelCase(`${repoBasename}`)), 'g'),
              _.upperFirst(_.camelCase(`${project.name}`)),
            );
          }
          UtilsFilesFoldersSync.writeFile(f, content);
        });
      }

      Helpers.remove(folder, true);
    }
    //#endregion

    //#region files to rename
    [project.pathFor('src/app.ts'), project.pathFor('env.ts')].forEach(f => {
      let content = UtilsFilesFoldersSync.readFile(f);
      const realtivePath = f.replace(project.location + '/', '');
      console.log(`Renaming content ${realtivePath}`);
      // const rules = RenameRule.from(
      //   `taon-${clonedBaselineProj.name} => ${project.name}`,
      // );
      if (!content) {
        return;
      }
      content = content.replace(
        new RegExp(`@taon-dev/${repoBasename}/src`, 'g'),
        `${project.name}/src`,
      );

      content = content.replace(
        new RegExp(`${repoBasename}`, 'g'),
        `${project.name}`,
      );

      if (repoBasename === 'baseline-docs') {
        content = content.replace(
          new RegExp(`DocsPageRoutes`, 'g'),
          `${_.upperFirst(_.camelCase(project.name))}Routes`,
        );
      }

      const fromName = _.upperFirst(_.camelCase(repoBasename));
      const toName = _.upperFirst(_.camelCase(project.name));

      [
        'AppConfig',
        'App',
        'ServerRoutes',
        'ClientRoutes',
        'ServerConfig',
        'Config',
        'Context',
        'StartFunction',
        ['Taon', 'BackofficeRoutes'],
        ['Taon', 'AbstractContext'],
      ].forEach(entry => {
        const [prefix, suffix] =
          typeof entry === 'string' ? ['', entry] : entry;

        const fromReplace = `${prefix}${fromName}${suffix}`;
        const toReplace = `${toName}${suffix}`;

        content = content.replaceAll(fromReplace, toReplace);
      });

      // for (const rule of rules) {
      //   content = rule.replaceInString(content);
      // }
      // content = content.replace(/from 'tnp-core\/src/g, `from '${config.npmScope}/core/source`);
      // content = content.replace(/from "tnp-core\/src/g, `from "${config.npmScope}/core/source`);
      UtilsFilesFoldersSync.writeFile(f, content);
    });
    //#endregion

    // TODO @LAST
    //#endregion
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
  ): Promise<string> {
    let { name: nameFromArgs, cwd, force } = options;
    const { appProj, containers, lastContainer, lastIsBrandNew, initGit } =
      await this._initContainersAndApps(cwd, nameFromArgs, force, options.type);

    Helpers.writeFile(
      [appProj.location, readmeMdMainProject],
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
        readmeMdMainProject,
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
    return appProj.name;
  }
  //#endregion
}

export default {
  $New: HelpersTaon.CLIWRAP($New, '$New'),
};
