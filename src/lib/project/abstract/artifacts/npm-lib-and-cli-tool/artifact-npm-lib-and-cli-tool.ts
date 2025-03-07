//#region imports
import { config } from 'tnp-config/src';
import {
  chalk,
  CoreModels,
  crossPlatformPath,
  dateformat,
  fse,
  glob,
  path,
  rimraf,
} from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers, UtilsQuickFixes } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  DEFAULT_PORT,
  MESSAGES,
  PortUtils,
  tmpBaseHrefOverwriteRelPath,
  tmpBuildPort,
} from '../../../../constants';
import {
  BuildOptions,
  ClearOptions,
  InitOptions,
  ReleaseOptions,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../__base__/base-artifact';

import { IncrementalBuildProcess } from './tools/build-isomorphic-lib/compilations/incremental-build-process';
import { CopyManager } from './tools/copy-manager/copy-manager';
import {
  FilesRecreator,
  FilesTemplatesBuilder,
} from './tools/files-recreation';
import { IndexAutogenProvider } from './tools/index-autogen-provider';
import { InsideStructures } from './tools/inside-structures/inside-structures';
import { LibProjectSmartContainer } from './tools/lib-project/lib-project-smart-container';
import { LibProjectStandalone } from './tools/lib-project/lib-project-standalone';
import { SingularBuild } from './tools/singular-build';
import { CypressTestRunner } from './tools/test-runner/cypress-test-runner';
import { JestTestRunner } from './tools/test-runner/jest-test-runner';
import { MochaTestRunner } from './tools/test-runner/mocha-test-runner';
import { WebpackBackendCompilation } from './webpack-backend-compilation';
import { BaseContext, Taon } from 'taon/src';
import { BuildProcessController } from '../__base__/build-process/app/build-process/build-process.controller';
import { BuildProcess } from '../__base__/build-process/app/build-process/build-process';
//#endregion

export class ArtifactNpmLibAndCliTool extends BaseArtifact {
  //#region fields
  public __copyManager: CopyManager;
  public __libStandalone: LibProjectStandalone;
  public __libSmartContainer: LibProjectSmartContainer;

  public __tests: MochaTestRunner;
  public __testsJest: JestTestRunner;
  public __testsCypress: CypressTestRunner;

  public __singularBuild: SingularBuild;
  public __webpackBackendBuild: WebpackBackendCompilation;
  public indexAutogenProvider: IndexAutogenProvider;

  public __filesTemplatesBuilder: FilesTemplatesBuilder;
  public filesRecreator: FilesRecreator;
  public __insideStructure: InsideStructures;

  //#endregion

  //#region constructor
  //#region @backend
  constructor(project: Project) {
    super(project);
    this.__copyManager = CopyManager.for(project);
    this.__libStandalone = new LibProjectStandalone(project);
    this.__libSmartContainer = new LibProjectSmartContainer(project);

    this.__tests = new MochaTestRunner(project);
    this.__testsJest = new JestTestRunner(project);
    this.__testsCypress = new CypressTestRunner(project);

    this.__singularBuild = new SingularBuild(project);
    this.__webpackBackendBuild = new WebpackBackendCompilation(project);
    this.indexAutogenProvider = new IndexAutogenProvider(project);

    this.__filesTemplatesBuilder = new FilesTemplatesBuilder(project);
    this.filesRecreator = new FilesRecreator(project);
    this.__insideStructure = new InsideStructures(project);
  }
  //#endregion
  //#endregion

  //#region struct
  async structPartial(initOptions: InitOptions): Promise<void> {
    //#region @backendFunc
    initOptions = InitOptions.from(initOptions);
    initOptions.purpose = 'only structure init';
    initOptions.struct = true;
    await this.initPartial(initOptions);
    //#endregion
  }
  //#endregion

  //#region init
  async initPartial(initOptions: InitOptions): Promise<void> {
    //#region @backendFunc
    initOptions = InitOptions.from(initOptions);
    if (
      this.project.framework.isContainer &&
      this.project.framework.frameworkVersionLessThan('v18')
    ) {
      Helpers.warn(`Not initing ${this.project.genericName}`);
      return;
    }

    Helpers.removeFileIfExists(
      path.join(this.project.location, config.file.tnpEnvironment_json),
    );
    this.project.vsCodeHelpers.recreateExtensions();
    this.project.vsCodeHelpers.recreateWindowTitle();
    this.project.vsCodeHelpers.__saveLaunchJson();
    // });

    if (
      this.project.framework.isStandaloneProject &&
      this.project.releaseProcess.isInCiReleaseProject
    ) {
      this.project.packageJson.setMainProperty(
        'dist/app.electron.js',
        'update main for electron',
      );
    }

    const smartContainerTargetName =
      this.project.framework.smartContainerBuildTarget?.name;

    Helpers.log(
      `[init] adding project is not exists...done(${this.project.genericName})  `,
    );

    this.project.quickFixes.addMissingSrcFolderToEachProject();

    if (this.project.framework.isSmartContainer) {
      const children = this.project.children;
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        if (
          child.framework.frameworkVersion !==
          this.project.framework.frameworkVersion
        ) {
          await child.taonJson.setFrameworkVersion(
            this.project.taonJson.frameworkVersion,
          );
        }
      }
    }

    if (
      this.project.framework.isStandaloneProject ||
      this.project.framework.isSmartContainerChild
    ) {
      await this.project.artifactsManager.globalHelper.branding.apply(
        !!initOptions.branding,
      );
    }

    this.project.quickFixes.missingAngularLibFiles();
    if (
      this.project.framework.isStandaloneProject ||
      this.project.framework.isContainer
    ) {
      this.project.quickFixes.createDummyEmptyLibsReplacements([]);
    }

    Helpers.taskStarted(
      `Initing project: ${chalk.bold(this.project.genericName)} ${
        initOptions.struct ? '(without packages install)' : ''
      } `,
    );

    Helpers.log(
      `Push to alread inited ${this.project.genericName} from ${this.project.location} `,
    );

    await this.filesRecreator.recreateSimpleFiles(initOptions);
    this.filesRecreator.vscode.settings.toogleHideOrShowDeps();

    if (
      this.project.framework.isStandaloneProject ||
      this.project.framework.isSmartContainer
    ) {
      await this.project.artifactsManager.globalHelper.env.init();
      this.__filesTemplatesBuilder.rebuild();
    }

    if (!initOptions.struct) {
      await this.project.nodeModules.makeSureInstalled();
    }

    this.project.npmHelpers.copyDepsFromCoreContainer(
      `Show new deps for ${this.project.framework.frameworkVersion} `,
    );

    this.project.quickFixes.addMissingSrcFolderToEachProject();

    this.project.quickFixes.removeBadTypesInNodeModules();
    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask(
        {
          watch: initOptions.watch,
        },
      );
    }

    if (this.project.framework.isSmartContainer) {
      //#region handle smart container

      await this.filesRecreator.recreateSimpleFiles(initOptions);

      await this.__singularBuild.initSingularBuild(
        initOptions,
        smartContainerTargetName,
      );

      //#endregion
    }

    Helpers.log(
      `Init DONE for project: ${chalk.bold(this.project.genericName)} `,
    );

    this.project.linter.recreateLintConfiguration();
    await this.artifacts.docsWebapp.docs.init();

    await this.creteBuildInfoFile(initOptions);
    this.project.quickFixes.fixAppTsFile();

    initOptions.finishCallback();
    //#endregion
  }
  //#endregion

  buildPartial(options: BuildOptions): Promise<void> {
    return void 0; // TODO implement
  }
  releasePartial(options: ReleaseOptions): Promise<void> {
    return void 0; // TODO implement
  }
  clearPartial(options?: ClearOptions): Promise<void> {
    return void 0; // TODO implement
  }

  //#region release children
  private async releaseChildrenLibApps(
    releaseOptions: ReleaseOptions,
  ): Promise<void> {
    // TODO @LAST move to artifact
    //#region @backendFunc

    //#region prepare params
    if (releaseOptions.automaticRelease) {
      global.tnpNonInteractive = true;
    }
    if (this.project.taonJson.cliLibReleaseOptions.cliBuildObscure) {
      releaseOptions.cliBuildObscure = true;
    }
    if (this.project.taonJson.cliLibReleaseOptions.cliBuildUglify) {
      releaseOptions.cliBuildUglify = true;
    }
    if (this.project.taonJson.cliLibReleaseOptions.cliBuildNoDts) {
      releaseOptions.cliBuildNoDts = true;
    }
    if (this.project.taonJson.cliLibReleaseOptions.cliBuildIncludeNodeModules) {
      releaseOptions.cliBuildIncludeNodeModules = true;
    }

    const automaticReleaseDocs = !!releaseOptions.automaticReleaseDocs;
    if (automaticReleaseDocs) {
      global.tnpNonInteractive = true;
    }

    if (
      !releaseOptions.automaticRelease &&
      automaticReleaseDocs &&
      !this.artifacts.angularNodeApp.__docsAppBuild.configExists
    ) {
      Helpers.error(
        `To use command:  ${config.frameworkName} automatic:release:docs
    you have to build manulally your app first....

    Try:
    ${config.frameworkName} release # by building docs app, you will save configuration for automatic build



    `,
        false,
        true,
      );
    }

    if (this.project.framework.isSmartContainerChild) {
      Helpers.error(`Smart container not supported yet...`, false, true);
    }

    // if (!global.tnpNonInteractive) {
    //   Helpers.clearConsole();
    // }
    //#endregion

    //#region resolve ishould release library
    if (releaseOptions.shouldReleaseLibrary) {
      if (releaseOptions.releaseVersionBumpType === 'major') {
        const newVersion =
          this.project.packageJson
            .versionWithMajorPlusOneAndMinorZeroAndPatchZero;
        this.project.packageJson.setVersion(newVersion);
      } else if (releaseOptions.releaseVersionBumpType === 'minor') {
        const newVersion =
          this.project.packageJson.versionWithMinorPlusOneAndPatchZero;
        this.project.packageJson.setVersion(newVersion);
      } else if (releaseOptions.releaseVersionBumpType === 'patch') {
        const newVersion = this.project.packageJson.versionWithPatchPlusOne;
        this.project.packageJson.setVersion(newVersion);
      }
    }
    //#endregion

    this.project.npmHelpers.copyDepsFromCoreContainer('Release');

    if (
      this.project.framework.isContainer &&
      !this.project.framework.isSmartContainer
    ) {
      //#region container release

      //#region resolve deps
      releaseOptions.resolved = releaseOptions.resolved.filter(
        f => f.location !== this.project.location,
      );

      const depsOnlyToPush = [];
      //#endregion

      //#region filter children
      for (let index = 0; index < releaseOptions.resolved.length; index++) {
        const child = releaseOptions.resolved[index];

        const lastBuildHash = child.packageJson.getBuildHash();
        const lastTagHash = child.git.lastTagHash();
        const versionIsOk = !!releaseOptions.specifiedVersion
          ? child.framework.frameworkVersionAtLeast(
              releaseOptions.specifiedVersion as any,
            )
          : true;

        const shouldRelease =
          !child.framework.isSmartContainerChild && versionIsOk;

        Helpers.log(`ACTUALL RELEASE ${child.name}: ${shouldRelease}
      lastBuildHash: ${lastBuildHash}
      lastTagHash: ${lastTagHash}
      isPrivate: ${child.packageJson.isPrivate}
      versionIsOk: ${versionIsOk}
      `);

        if (!shouldRelease) {
          // child.git.addAndCommit();
          // await child.git.pushCurrentBranch();

          depsOnlyToPush.push(child);
          releaseOptions.resolved[index] = void 0;
        }
      }
      releaseOptions.resolved = releaseOptions.resolved
        .filter(f => !!f)
        .map(c => this.project.ins.From(c.location));
      //#endregion

      //#region projs tempalte
      const projsTemplate = (child?: Project) => {
        return `

    PROJECTS FOR RELEASE: ${
      releaseOptions.specifiedVersion
        ? '(only framework version = ' + releaseOptions.specifiedVersion + ' )'
        : ''
    }

${releaseOptions.resolved
  .filter(p => {
    if (releaseOptions.resolved.length > 0) {
      return releaseOptions.resolved.includes(p);
    }
    return true;
  })
  .map((p, i) => {
    const bold = child?.name === p.name;
    const index = i + 1;
    return `(${bold ? chalk.underline(chalk.bold(index.toString())) : index}. ${
      bold ? chalk.underline(chalk.bold(p.name)) : p.name
    }@${p.packageJson.versionWithPatchPlusOne})`;
  })
  .join(', ')}


${Helpers.terminalLine()}
processing...
    `;
      };
      //#endregion

      //#region release loop

      for (let index = 0; index < releaseOptions.resolved.length; index++) {
        const child = releaseOptions.resolved[index] as Project;
        if (releaseOptions.only) {
          releaseOptions.only = Array.isArray(releaseOptions.only)
            ? releaseOptions.only
            : [releaseOptions.only];

          if (
            !releaseOptions.only.includes(child.name) &&
            !releaseOptions.only.includes(child.basename)
          ) {
            continue;
          }
        }

        if (releaseOptions.start) {
          if (
            child.name !== releaseOptions.start &&
            child.basename !== releaseOptions.start
          ) {
            continue;
          }
          releaseOptions.start = void 0;
        }
        // console.log({ child })

        if (index === 0) {
          global.tnpNonInteractive = releaseOptions.resolved.length === 0;
          // Helpers.info(`
          // to release
          // ${depsOfResolved.map((d, i) => i + '.' + d.name).join('\n')}
          // `)
        }

        const exitBecouseNotInResolved =
          releaseOptions.resolved.length > 0 &&
          _.isUndefined(
            releaseOptions.resolved.find(c => c.location === child.location),
          );

        if (exitBecouseNotInResolved) {
          continue;
        }

        Helpers.clearConsole();
        Helpers.info(projsTemplate(child));

        await child.release(
          releaseOptions.clone({
            resolved: [],
            skipProjectProcess: releaseOptions.skipProjectProcess,
          }),
        );

        if (releaseOptions.end) {
          if (
            child.name === releaseOptions.end ||
            child.basename === releaseOptions.end
          ) {
            Helpers.info('Done. Release end on project: ' + releaseOptions.end);
            process.exit(0);
          }
        }
      }
      //#endregion

      Helpers.clearConsole();
      Helpers.info(projsTemplate());

      //#region display end message
      if (releaseOptions.resolved.length === 0) {
        for (let index = 0; index < depsOnlyToPush.length; index++) {
          const depForPush = depsOnlyToPush[index] as Project;

          Helpers.warn(`

        No realase needed for ${chalk.bold(
          depForPush.name,
        )} ..just initing and pushing to git...

        `); // hash in package.json to check

          if (
            depForPush.typeIs('isomorphic-lib') &&
            depForPush.framework.isSmartContainer
          ) {
            try {
              await depForPush.init(
                InitOptions.from({ purpose: 'release chain init' }),
              );
            } catch (error) {
              console.error(error);
              Helpers.info(`Not able to init fully...`);
            }
          }

          depForPush.git.stageAllAndCommit(`release push`);
          await depForPush.git.pushCurrentBranch();
        }

        this.project.git.stageAllAndCommit(`Update after release`);
        await this.project.git.pushCurrentBranch();
        const tnpProj = this.project.ins.Tnp;
        tnpProj.git.stageAllAndCommit(`Update after release`);
        await tnpProj.git.pushCurrentBranch();
        Helpers.success(`

      [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
      R E L E A S E   O F   C O N T I A I N E R  ${chalk.bold(
        this.project.genericName,
      )}  D O N E


      `);
      } else {
        Helpers.success(`

      [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
      P A R T I A L  R E L E A S E   O F   C O N T I A I N E R  ${chalk.bold(
        this.project.genericName,
      )}  D O N E


      `);
      }
      //#endregion

      //#endregion
    } else {
      //#region standalone project release

      await this.project.nodeModules.makeSureInstalled();

      const tryReleaseProject = async () => {
        while (true) {
          try {
            await this.initPartial(
              InitOptions.from({
                purpose: 'release project init',
              }),
            ); // TODO not needed build includes init
            break;
          } catch (error) {
            console.error(error);
            if (
              !(await Helpers.consoleGui.question.yesNo(
                `Not able to INIT your project ${chalk.bold(
                  this.project.genericName,
                )} try again..`,
              ))
            ) {
              releaseOptions?.finishCallback();
            }
          }
        }
      };

      while (true) {
        await tryReleaseProject();
        try {
          await this.artifacts.npmLibAndCliTool.releaseLibProcess(
            releaseOptions,
          );
          break;
        } catch (error) {
          console.error(error);
          Helpers.error(
            `Not able to RELEASE your project ${chalk.bold(this.project.genericName)}`,
            true,
            true,
          );
          const errorOptions = {
            tryAgain: {
              name: 'Try again',
            },
            skipPackage: {
              name: 'Skip release for this package',
            },
            exit: {
              name: 'Exit process',
            },
          };
          const res = await Helpers.consoleGui.select<
            keyof typeof errorOptions
          >('What you wanna do ?', errorOptions);

          if (res === 'exit') {
            process.exit(0);
          } else if (res === 'skipPackage') {
            break;
          }
        }
      }

      //#endregion
    }
    //#endregion
  }
  //#endregion

  //#region release lib process
  private async releaseLibProcess(releaseOptions: ReleaseOptions) {
    //#region @backendFunc
    const {
      prod = false,
      shouldReleaseLibrary,
      automaticReleaseDocs,
      automaticRelease,
    } = releaseOptions;

    if (!this.project.releaseProcess.isInCiReleaseProject) {
      const tempGeneratedCiReleaseProject =
        await this.__createTempCiReleaseProject(BuildOptions.from({}));
      await tempGeneratedCiReleaseProject.artifactsManager.artifact.npmLibAndCliTool.releaseLibProcess(
        releaseOptions,
      );
      return;
    }

    Helpers.log(`automaticRelease=${automaticRelease}`);
    Helpers.log(`global.tnpNonInteractive=${global.tnpNonInteractive}`);

    const realCurrentProj =
      this.project.releaseProcess.__releaseCiProjectParent;

    let specificProjectForBuild: Project;

    if (shouldReleaseLibrary && !automaticReleaseDocs) {
      //#region publish lib process
      var newVersion = realCurrentProj.packageJson.version;

      await this.project.npmHelpers.loginToRegistry();
      await this.project.npmHelpers.checkProjectReadyForNpmRelease();

      // TODO somehting need when decide what is child
      // for standalone or smartcontainer
      // if (this.isStandaloneProject) {
      //   await this.__libStandalone.bumpVersionInOtherProjects(newVersion, true);
      // }

      this.project.git.__commitRelease(newVersion);

      this.project.packageJson.setVersion(newVersion);
      this.project.npmHelpers.copyDepsFromCoreContainer('show for release');

      specificProjectForBuild = await this.__releaseBuildProcess({
        realCurrentProj,
        releaseOptions,
        cutNpmPublishLibReleaseCode: true,
      });

      if (this.project.framework.isSmartContainer) {
        specificProjectForBuild.artifactsManager.artifact.npmLibAndCliTool.__libSmartContainer.preparePackage(
          this.project,
          newVersion,
        );
      }

      if (this.project.framework.isStandaloneProject) {
        specificProjectForBuild.artifactsManager.artifact.npmLibAndCliTool.__libStandalone.preparePackage(
          this.project,
          newVersion,
        );
      }

      if (this.project.framework.isStandaloneProject) {
        this.project.artifactsManager.artifact.npmLibAndCliTool.__libStandalone.fixPackageJson(
          realCurrentProj,
        );
      }

      if (this.project.framework.isStandaloneProject) {
        realCurrentProj.releaseProcess.updateStanaloneProjectBeforePublishing(
          this.project,
          realCurrentProj,
          specificProjectForBuild,
        );
      } else {
        realCurrentProj.releaseProcess.updateContainerProjectBeforePublishing(
          this.project,
          realCurrentProj,
          specificProjectForBuild,
        );
      }

      let publish = true;

      const readyToNpmPublishVersionPath = `${this.project.framework.__getTempProjName('dist')}/${
        config.folder.node_modules
      }`;
      if (this.project.framework.isStandaloneProject) {
        const distFolder = crossPlatformPath([
          specificProjectForBuild.location,
          readyToNpmPublishVersionPath,
          realCurrentProj.name,
          config.folder.dist,
        ]);
        // console.log('Remove dist ' + distFolder)
        Helpers.remove(distFolder);
      } else {
        for (const child of realCurrentProj.children) {
          const distFolder = crossPlatformPath([
            specificProjectForBuild.location,
            readyToNpmPublishVersionPath,
            '@',
            realCurrentProj.name,
            child.name,
            config.folder.dist,
          ]);
          // console.log('Remove dist ' + distFolder)
          Helpers.remove(distFolder);
        }
      }

      if (!global.tnpNonInteractive) {
        await Helpers.questionYesNo(
          `Do you wanna check compiled version before publishing ?`,
          async () => {
            specificProjectForBuild
              .run(`code ${readyToNpmPublishVersionPath}`)
              .sync();
            Helpers.pressKeyAndContinue(
              `Check your compiled code and press any key ...`,
            );
          },
        );
      }

      publish = await Helpers.questionYesNo(`Publish this package ?`);

      if (publish) {
        if (this.project.framework.isSmartContainer) {
          await specificProjectForBuild.artifactsManager.artifact.npmLibAndCliTool.__libSmartContainer.publish(
            {
              realCurrentProj,
              rootPackageName: `@${this.project.name}`,
              newVersion,
              automaticRelease,
              prod,
            },
          );
        }

        if (this.project.framework.isStandaloneProject) {
          await specificProjectForBuild.artifactsManager.artifact.npmLibAndCliTool.__libStandalone.publish(
            {
              realCurrentProj,
              newVersion,
              automaticRelease,
              prod,
            },
          );
        }
      } else {
        Helpers.info('Omitting npm publish...');
      }

      //#endregion
    }

    //#region build docs
    if (!global.tnpNonInteractive || automaticReleaseDocs) {
      // Helpers.clearConsole();
      await new Promise<void>(async (resolve, reject) => {
        if (this.project.framework.isStandaloneProject) {
          await this.project.artifactsManager.artifact.npmLibAndCliTool.__libStandalone.buildDocs(
            prod,
            realCurrentProj,
            automaticReleaseDocs,
            async () => {
              try {
                specificProjectForBuild = await this.__releaseBuildProcess({
                  realCurrentProj,
                  releaseOptions,
                  cutNpmPublishLibReleaseCode: false,
                });
                resolve();
              } catch (error) {
                reject(error);
              }
            },
          );
        }

        if (this.project.framework.isSmartContainer) {
          await this.project.artifactsManager.artifact.npmLibAndCliTool.__libSmartContainer.buildDocs(
            prod,
            realCurrentProj,
            automaticReleaseDocs,
            async () => {
              try {
                specificProjectForBuild = await this.__releaseBuildProcess({
                  realCurrentProj,
                  releaseOptions,
                  cutNpmPublishLibReleaseCode: false,
                });
                resolve();
              } catch (error) {
                reject(error);
              }
            },
          );
        }
      });

      this.project.git.__commitRelease(newVersion);
    }
    //#endregion

    //#region push code to repo
    const docsCwd = realCurrentProj.pathFor('docs');

    if (!automaticReleaseDocs && Helpers.exists(docsCwd)) {
      await this.project.artifactsManager.artifact.npmLibAndCliTool.__displayInfoBeforePublish(
        realCurrentProj,
        DEFAULT_PORT.DIST_SERVER_DOCS,
      );
    }

    await this.project.git.pushToGitRepo(
      realCurrentProj,
      newVersion,
      automaticReleaseDocs,
    );
    if (!automaticReleaseDocs && Helpers.exists(docsCwd)) {
      await Helpers.killProcessByPort(DEFAULT_PORT.DIST_SERVER_DOCS);
    }
    //#endregion

    Helpers.info('RELEASE DONE');
    //#endregion
  }
  //#endregion

  //#region getters & methods / info before publish
  public async __displayInfoBeforePublish(
    realCurrentProj: Project,
    defaultTestPort: Number,
  ) {
    //#region @backendFunc
    if (this.project.artifactsManager.globalHelper.env.config?.useDomain) {
      Helpers.info(
        `Cannot local preview.. using doamin: ` +
          `${this.project.artifactsManager.globalHelper.env.config.domain}`,
      );
      return;
    }
    const originPath = `http://localhost:`;
    const docsCwd = realCurrentProj.pathFor('docs');
    if (!Helpers.exists(docsCwd)) {
      return;
    }
    await Helpers.killProcessByPort(DEFAULT_PORT.DIST_SERVER_DOCS);
    const commandHostLoclDocs =
      `taon-http-server -s -p ` +
      `${DEFAULT_PORT.DIST_SERVER_DOCS} --base-dir ${this.project.name}`;

    // console.log({
    //   cwd, commandHostLoclDocs
    // })
    Helpers.run(commandHostLoclDocs, {
      cwd: docsCwd,
      output: false,
      silence: true,
    }).async();
    if (this.project.framework.isStandaloneProject) {
      Helpers.info(`Before pushing you can acces project here:

- ${originPath}${defaultTestPort}/${this.project.name}

`);
    }
    if (this.project.framework.isSmartContainer) {
      const smartContainer = this.project;
      const mainProjectName =
        smartContainer.framework.smartContainerBuildTarget.name;
      const otherProjectNames = smartContainer.children
        .filter(c => c.name !== mainProjectName)
        .map(p => p.name);
      Helpers.info(`Before pushing you can acces projects here:

- ${originPath}${defaultTestPort}/${smartContainer.name}
${otherProjectNames
  .map(c => `- ${originPath}${defaultTestPort}/${smartContainer.name}/-/${c}`)
  .join('\n')}

`);
    }

    //#endregion
  }
  //#endregion

  //#region clear lib
  async clearLib(options: ClearOptions) {
    //#region @backendFunc
    Helpers.taskStarted(`Cleaning project: ${this.project.genericName}`);
    const { recrusive } = options || {};
    if (
      this.project.typeIs('unknown') ||
      this.project.typeIs('unknown-npm-project')
    ) {
      return;
    }

    while (true) {
      try {
        rimraf.sync(
          crossPlatformPath([this.project.location, config.folder.tmp + '*']),
        );
        rimraf.sync(
          crossPlatformPath([this.project.location, config.folder.dist + '*']),
        );
        try {
          this.project.removeFile(config.folder.node_modules);
        } catch (error) {
          this.project.remove(config.folder.node_modules);
        }
        this.project.removeFile(config.folder.browser);
        this.project.removeFile(config.folder.websql);
        this.project.removeFile(config.file.tnpEnvironment_json);
        if (this.project.framework.isCoreProject) {
          return;
        }

        glob
          .sync(`${this.project.location}/*.filetemplate`)
          .forEach(fileTemplate => {
            Helpers.remove(fileTemplate);
            Helpers.remove(fileTemplate.replace('.filetemplate', ''));
          });

        Helpers.removeIfExists(
          path.join(this.project.location, config.file.tnpEnvironment_json),
        );
        break;
      } catch (error) {
        Helpers.pressKeyAndContinue(MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS);
      }
    }

    this.project.quickFixes.addMissingSrcFolderToEachProject();
    Helpers.info(`Cleaning project: ${this.project.genericName} done`);

    if (recrusive) {
      for (const child of this.project.children) {
        await child.clear(options);
      }
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / pack resources
  public __packResourceInReleaseDistResources(releaseDistFolder: string) {
    //#region @backendFunc
    this.project.npmHelpers.checkProjectReadyForNpmRelease();

    if (!fse.existsSync(releaseDistFolder)) {
      fse.mkdirSync(releaseDistFolder);
    }
    []
      .concat([
        ...this.project.taonJson.resources,
        ...(this.project.framework.isSmartContainerChild
          ? [config.file._npmignore, config.file.taon_jsonc]
          : [config.file._npmignore]),
      ])
      .forEach(res => {
        //  copy resource to org build and copy shared assets
        const file = path.join(this.project.location, res);
        const dest = path.join(releaseDistFolder, res);
        if (!fse.existsSync(file)) {
          Helpers.error(
            `[${config.frameworkName}][lib-project] Resource file: ${chalk.bold(
              path.basename(file),
            )} does not ` +
              `exist in "${this.project.genericName}"  (package.json > resources[])
        `,
            false,
            true,
          );
        }
        if (fse.lstatSync(file).isDirectory()) {
          // console.log('IS DIRECTORY', file)
          // console.log('IS DIRECTORY DEST', dest)
          const filter = src => {
            return !/.*node_modules.*/g.test(src);
          };
          Helpers.copy(file, dest, { filter });
        } else {
          // console.log('IS FILE', file)
          fse.copyFileSync(file, dest);
        }
      });
    Helpers.logInfo(
      `Resources copied to release folder: ${config.folder.dist}`,
    );
    //#endregion
  }
  //#endregion

  //#region getters & methods / build lib placeholder
  public async __buildLib(buildOptions: BuildOptions) {
    //#region @backendFunc
    Helpers.log(`[buildLib] called buildLib not implemented`);
    if (this.project.framework.isStandaloneProject) {
      //#region preparing variables

      //#region preparing variables & fixing things
      const { outDir, watch, cutNpmPublishLibReleaseCode } = buildOptions;

      this.project.quickFixes.__fixBuildDirs(outDir);

      // Helpers.info(`[buildLib] start of building ${websql ? '[WEBSQL]' : ''}`);
      Helpers.log(`[buildLib] start of building...`);
      this.__copyEssentialFilesTo(
        this.project,
        [crossPlatformPath([this.project.pathFor(outDir)])],
        outDir,
      );

      const {
        cliBuildObscure,
        cliBuildUglify,
        cliBuildNoDts,
        cliBuildIncludeNodeModules,
      } = buildOptions;
      const productionModeButIncludePackageJsonDeps =
        (cliBuildObscure || cliBuildUglify) && !cliBuildIncludeNodeModules;

      //#endregion

      //#region preparing variables / incremental build

      const incrementalBuildProcess = new IncrementalBuildProcess(
        this.project,
        buildOptions.clone({
          websql: false,
        }),
      );

      const incrementalBuildProcessWebsql = new IncrementalBuildProcess(
        this.project,
        buildOptions.clone({
          websql: true,
          genOnlyClientCode: true,
        }),
      );

      const proxyProject =
        this.project.artifactsManager.globalHelper.__getProxyNgProj(
          buildOptions.clone({
            websql: false,
          }),
          'lib',
        );

      const proxyProjectWebsql =
        this.project.artifactsManager.globalHelper.__getProxyNgProj(
          buildOptions.clone({
            websql: true,
          }),
          'lib',
        );

      Helpers.log(`

    proxy Proj = ${proxyProject?.location}
    proxy Proj websql = ${proxyProjectWebsql?.location}

    `);

      //#endregion

      //#region preparing variables / general
      const isStandalone = !this.project.framework.isSmartContainer;

      const sharedOptions = () => {
        return {
          // askToTryAgainOnError: true,
          exitOnErrorCallback: async code => {
            if (buildOptions.buildForRelease) {
              throw 'Typescript compilation lib error';
            } else {
              Helpers.error(
                `[${config.frameworkName}] Typescript compilation lib error (code=${code})`,
                false,
                true,
              );
            }
          },
          outputLineReplace: (line: string) => {
            if (isStandalone) {
              if (line.startsWith('WARNING: postcss-url')) {
                return ' --- [taon] IGNORED WARN ---- ';
              }

              line = line.replace(
                `projects/${this.project.name}/src/`,
                `./src/`,
              );

              if (line.search(`/src/libs/`) !== -1) {
                const [__, ___, ____, moduleName] = line.split('/');
                // console.log({
                //   moduleName,
                //   standalone: 'inlib'
                // })
                return line.replace(
                  `/src/libs/${moduleName}/`,
                  `/${moduleName}/src/lib/`,
                );
              }

              return line;
            }
            return line;
          },
        } as CoreModels.ExecuteOptions;
      };
      //#endregion

      //#region prepare variables / command
      // const command = `${loadNvm} && ${this.npmRunNg} build ${this.name} ${watch ? '--watch' : ''}`;
      const commandForLibraryBuild = `${this.NPM_RUN_NG_COMMAND} build ${this.project.name} ${
        watch ? '--watch' : ''
      }`;
      //#endregion

      //#region prepare variables / angular info
      const showInfoAngular = () => {
        Helpers.info(
          `Starting browser Angular/TypeScirpt build.... ${
            buildOptions.websql ? '[WEBSQL]' : ''
          }`,
        );
        Helpers.log(`

      ANGULAR ${this.project.ins.Tnp?.packageJson.version} ${
        buildOptions.watch ? 'WATCH ' : ''
      } LIB BUILD STARTED... ${buildOptions.websql ? '[WEBSQL]' : ''}

      `);

        Helpers.log(` command: ${commandForLibraryBuild}`);
      };
      //#endregion

      //#endregion

      if (
        this.project.artifactsManager.artifact.npmLibAndCliTool
          .indexAutogenProvider.generateIndexAutogenFile &&
        this.project.framework.isStandaloneProject
      ) {
        await this.project.artifactsManager.artifact.npmLibAndCliTool.indexAutogenProvider.runTask(
          {
            watch: buildOptions.watch,
          },
        );
      } else {
        this.project.artifactsManager.artifact.npmLibAndCliTool.indexAutogenProvider.writeIndexFile(
          true,
        );
      }

      if (buildOptions.watch) {
        if (productionModeButIncludePackageJsonDeps) {
          //#region webpack dist release build
          console.log('Startomg build');
          try {
            await incrementalBuildProcess.startAndWatch(
              `isomorphic compilation (only browser) `,
            );
          } catch (error) {
            console.log('CATCH INCE normal');
          }

          try {
            await incrementalBuildProcessWebsql.startAndWatch(
              `isomorphic compilation (only browser) [WEBSQL]`,
            );
          } catch (error) {
            console.log('CATCH INCE webcsal');
          }

          // Helpers.error(`Watch build not available for dist release build`, false, true);
          // Helpers.info(`Starting watch dist release build for fast cli.. ${this.buildOptions.websql ? '[WEBSQL]' : ''}`);
          Helpers.info(`Starting watch dist release build for fast cli.. `);

          try {
            await this.project.artifactsManager.artifact.npmLibAndCliTool.__webpackBackendBuild.run(
              BuildOptions.from({
                buildType: 'lib',
                outDir,
                watch,
              }),
            );
          } catch (er) {
            Helpers.error(
              `WATCH ${outDir.toUpperCase()} build failed`,
              false,
              true,
            );
          }
          //#endregion
        } else {
          //#region watch backend compilation

          await incrementalBuildProcess.startAndWatch(
            'isomorphic compilation (watch mode)',
          );
          await incrementalBuildProcessWebsql.startAndWatch(
            'isomorphic compilation (watch mode) [WEBSQL]',
          );

          if (this.project.framework.frameworkVersionAtLeast('v3')) {
            // TOOD
            showInfoAngular();

            if (isStandalone || this.project.framework.isSmartContainerTarget) {
              try {
                await proxyProject.execute(commandForLibraryBuild, {
                  similarProcessKey: 'ng',
                  resolvePromiseMsg: {
                    stdout: 'Compilation complete. Watching for file changes',
                  },
                  ...sharedOptions(),
                });
                await proxyProjectWebsql.execute(commandForLibraryBuild, {
                  similarProcessKey: 'ng',
                  resolvePromiseMsg: {
                    stdout: 'Compilation complete. Watching for file changes',
                  },
                  ...sharedOptions(),
                });
              } catch (error) {
                console.log(error);
              }
            }
          }
          //#endregion
        }
      } else {
        //#region non watch build

        if (cutNpmPublishLibReleaseCode) {
          this.__cutReleaseCodeFromSrc(buildOptions);
        }

        if (productionModeButIncludePackageJsonDeps) {
          //#region release production backend build for taon/tnp specific

          await incrementalBuildProcess.start(
            'isomorphic compilation (only browser) ',
          );
          await incrementalBuildProcessWebsql.start(
            'isomorphic compilation (only browser) [WEBSQL] ',
          );

          //#region webpack build @deprecated
          try {
            await this.project.artifactsManager.artifact.npmLibAndCliTool.__webpackBackendBuild.run(
              BuildOptions.from({
                buildType: 'lib',
                outDir,
                watch,
              }),
            );
          } catch (er) {
            Helpers.error(
              `${outDir.toUpperCase()} (single file compilation) build failed`,
              false,
              true,
            );
          }
          //#endregion

          //#region build without dts in dist @deprecated
          if (cliBuildNoDts) {
            const baseDistGenWebpackDts = crossPlatformPath(
              path.join(this.project.location, outDir, 'dist'),
            );
            Helpers.filesFrom(baseDistGenWebpackDts, true).forEach(
              absSource => {
                const destDtsFile = path.join(
                  this.project.location,
                  outDir,
                  absSource.replace(`${baseDistGenWebpackDts}/`, ''),
                );
                Helpers.copyFile(absSource, destDtsFile);
              },
            );
          }
          //#endregion

          Helpers.removeIfExists(
            path.join(this.project.location, outDir, 'dist'),
          );

          //#region obscure & uglify
          try {
            if (cliBuildObscure || cliBuildUglify) {
              this.__backendCompileToEs5(outDir);
            }
            if (cliBuildUglify) {
              this.__backendUglifyCode(
                outDir,
                config.reservedArgumentsNamesUglify,
              );
            }
            if (cliBuildObscure) {
              this.__backendObscureCode(
                outDir,
                config.reservedArgumentsNamesUglify,
              );
            }
          } catch (er) {
            Helpers.error(
              `${outDir.toUpperCase()} (cliBuildObscure || cliBuildUglify) process failed`,
              false,
              true,
            );
          }
          //#endregion

          //#region isomorphic compilation
          try {
            showInfoAngular();
            await proxyProject.execute(commandForLibraryBuild, {
              similarProcessKey: 'ng',
              ...sharedOptions(),
            });
            await proxyProjectWebsql.execute(commandForLibraryBuild, {
              similarProcessKey: 'ng',
              ...sharedOptions(),
            });
          } catch (e) {
            Helpers.log(e);
            Helpers.error(
              `
          Command failed: ${commandForLibraryBuild}

          Not able to build project: ${this.project.genericName}`,
              false,
              true,
            );
          }
          //#endregion

          //#endregion
        } else {
          //#region normal backend compilation

          await incrementalBuildProcess.start('isomorphic compilation');
          await incrementalBuildProcessWebsql.start('isomorphic compilation');

          try {
            showInfoAngular();
            await proxyProject.execute(commandForLibraryBuild, {
              similarProcessKey: 'ng',
              ...sharedOptions(),
            });
            await proxyProjectWebsql.execute(commandForLibraryBuild, {
              similarProcessKey: 'ng',
              ...sharedOptions(),
            });
            this.__showMesageWhenBuildLibDoneForSmartContainer(buildOptions);
          } catch (e) {
            Helpers.log(e);
            // TODO remove this error (it should not interrup release proces)
            Helpers.error(
              `
          Command failed: ${commandForLibraryBuild}

          Not able to build project: ${this.project.genericName}`,
              false,
              true,
            );
          }

          //#endregion
        }

        if (cliBuildIncludeNodeModules) {
          //#region build for including node_modules in compilation
          const cliJsFile = 'cli.js';
          this.project.quickFixes.removeTnpFromItself(async () => {
            this.__backendIncludeNodeModulesInCompilation(
              outDir,
              false, // cliBuildUglify,
              cliJsFile,
            );
          });
          //#endregion

          //#region uglify
          if (cliBuildUglify) {
            this.__backendUglifyCode(
              outDir,
              config.reservedArgumentsNamesUglify,
              cliJsFile,
            );
          }
          //#endregion

          //#region normal build not obscured
          if (!productionModeButIncludePackageJsonDeps) {
            if (cliBuildObscure || cliBuildUglify) {
              this.__backendCompileToEs5(outDir, cliJsFile);
            }
            if (cliBuildObscure) {
              this.__backendObscureCode(
                outDir,
                config.reservedArgumentsNamesUglify,
                cliJsFile,
              );
            }
          }
          //#endregion
        }

        if (cliBuildNoDts) {
          this.__backendRemoveDts(outDir);
        }

        if (cutNpmPublishLibReleaseCode) {
          this.__restoreCuttedReleaseCodeFromSrc(buildOptions);
        }
        //#endregion
      }

      this.__showMesageWhenBuildLibDoneForSmartContainer(buildOptions);
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / release build
  private async __releaseBuildProcess({
    realCurrentProj,
    releaseOptions,
    cutNpmPublishLibReleaseCode,
  }: {
    realCurrentProj: Project;
    releaseOptions: ReleaseOptions;
    cutNpmPublishLibReleaseCode: boolean;
  }) {
    //#region @backendFunc
    const {
      prod,
      cliBuildObscure,
      cliBuildIncludeNodeModules,
      cliBuildNoDts,
      cliBuildUglify,
    } = releaseOptions;

    // TODO  - only here so  smartContainerBuildTarget is available
    await this.initPartial(
      InitOptions.from({
        purpose: 'init before release process',
      }),
    );

    const specificProjectForBuild: Project = this.project.framework
      .isStandaloneProject
      ? this.project
      : (this.project.ins.From(
          crossPlatformPath(
            path.join(
              this.project.location,
              config.folder.dist,
              this.project.name,
              this.project.framework.smartContainerBuildTarget.name,
            ),
          ),
        ) as Project);

    await this.buildPartial(
      BuildOptions.from({
        buildType: 'lib',
        prod,
        cliBuildObscure,
        cliBuildIncludeNodeModules,
        cliBuildNoDts,
        cliBuildUglify,
        cutNpmPublishLibReleaseCode,
        skipProjectProcess: true,
        buildForRelease: true,
      }),
    );

    //#region prepare release resources
    const dists = [
      crossPlatformPath([specificProjectForBuild.location, config.folder.dist]),
      crossPlatformPath([
        specificProjectForBuild.location,
        specificProjectForBuild.framework.__getTempProjName('dist'),
        config.folder.node_modules,
        realCurrentProj.name,
      ]),
    ];

    if (realCurrentProj.framework.isStandaloneProject) {
      for (let index = 0; index < dists.length; index++) {
        const releaseDistFolder = dists[index];
        this.__createClientVersionAsCopyOfBrowser(
          specificProjectForBuild,
          releaseDistFolder,
        );
      }
    }

    for (let index = 0; index < dists.length; index++) {
      const releaseDist = dists[index];
      this.__compileBrowserES5version(specificProjectForBuild, releaseDist);
    }

    if (realCurrentProj.framework.isStandaloneProject) {
      for (let index = 0; index < dists.length; index++) {
        const releaseDist = dists[index];
        specificProjectForBuild.artifactsManager.artifact.npmLibAndCliTool.__packResourceInReleaseDistResources(
          releaseDist,
        );
      }
      this.__copyEssentialFilesTo(specificProjectForBuild, dists, 'dist');
    } else if (realCurrentProj.framework.isSmartContainer) {
      const rootPackageName = `@${this.project.name}`;
      const base = path.join(
        specificProjectForBuild.location,
        specificProjectForBuild.framework.__getTempProjName('dist'),
        config.folder.node_modules,
        rootPackageName,
      );
      const childrenPackages = Helpers.foldersFrom(base).map(f =>
        path.basename(f),
      );
      for (let index = 0; index < childrenPackages.length; index++) {
        const childName = childrenPackages[index];
        const child = this.project.ins.From([
          realCurrentProj.location,
          childName,
        ]) as Project;
        const releaseDistFolder = path.join(base, childName);
        child.artifactsManager.artifact.npmLibAndCliTool.__packResourceInReleaseDistResources(
          releaseDistFolder,
        );
      }
    }
    //#endregion

    return specificProjectForBuild;

    //#endregion
  }
  //#endregion

  //#region getters & methods / create client folder from browser folder
  private __createClientVersionAsCopyOfBrowser(
    this: {},
    project: Project,
    releaseDistFolder: string,
  ) {
    //#region @backendFunc
    const browser = path.join(releaseDistFolder, config.folder.browser);
    const client = path.join(releaseDistFolder, config.folder.client);
    if (fse.existsSync(browser)) {
      Helpers.remove(client);
      Helpers.tryCopyFrom(browser, client);
    } else {
      Helpers.logWarn(
        `Browser folder not generated.. replacing with dummy files: browser.js, client.js`,
        false,
      );
      const msg = `console.log('${project.genericName} only for backend') `;
      Helpers.writeFile(`${browser}.js`, msg);
      Helpers.writeFile(`${client}.js`, msg);
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / compile es5
  private __compileBrowserES5version(
    this: {},
    project: Project,
    pathReleaseDist: string,
  ) {
    //#region @backendFunc
    // TODO fix this for angular-lib
    if (project.framework.frameworkVersionAtLeast('v3')) {
      return;
    }

    if (
      project.framework.frameworkVersionEquals('v1') ||
      project.typeIsNot('isomorphic-lib')
    ) {
      return;
    }

    const cwdBrowser = path.join(pathReleaseDist, config.folder.browser);
    const cwdClient = path.join(pathReleaseDist, config.folder.client);
    const pathBabelRc = path.join(cwdBrowser, config.file._babelrc);
    const pathCompiled = path.join(cwdBrowser, 'es5');
    const pathCompiledClient = path.join(cwdClient, 'es5');
    Helpers.writeFile(pathBabelRc, '{ "presets": ["env"] }\n');
    try {
      Helpers.run(`babel . -d es5`, { cwd: cwdBrowser }).sync();
      Helpers.copy(pathCompiled, pathCompiledClient);
    } catch (err) {
      Helpers.removeFileIfExists(pathBabelRc);
      Helpers.error(err, true, true);
      Helpers.error(`Not able to create es5 version of lib`, false, true);
    }
    Helpers.removeFileIfExists(pathBabelRc);
    //#endregion
  }
  //#endregion

  //#region getters & methods / copy essential files
  private __copyEssentialFilesTo(
    this: {},
    project: Project,
    destinations: string[],
    outDir: 'dist',
  ) {
    //#region @backendFunc
    project.artifactsManager.artifact.npmLibAndCliTool.__copyWhenExist(
      'bin',
      destinations,
    );
    project.artifactsManager.artifact.npmLibAndCliTool.__linkWhenExist(
      config.file.package_json,
      destinations,
    );
    project.artifactsManager.artifact.npmLibAndCliTool.__copyWhenExist(
      config.file.taon_jsonc,
      destinations,
    );
    project.artifactsManager.artifact.npmLibAndCliTool.__copyWhenExist(
      '.npmrc',
      destinations,
    );
    project.artifactsManager.artifact.npmLibAndCliTool.__copyWhenExist(
      '.npmignore',
      destinations,
    );
    project.artifactsManager.artifact.npmLibAndCliTool.__copyWhenExist(
      '.gitignore',
      destinations,
    );
    if (project.typeIs('isomorphic-lib')) {
      project.artifactsManager.artifact.npmLibAndCliTool.__copyWhenExist(
        config.file.tnpEnvironment_json,
        destinations,
      );
    }

    if (project.releaseProcess.isInCiReleaseProject) {
      project.artifactsManager.artifact.npmLibAndCliTool.__copyWhenExist(
        config.file.package_json,
        destinations,
      );
      project.artifactsManager.artifact.npmLibAndCliTool.__linkWhenExist(
        config.folder.node_modules,
        destinations,
      );
      project.artifactsManager.artifact.npmLibAndCliTool.__copyWhenExist(
        'package.json',
        destinations.map(d => crossPlatformPath([d, config.folder.client])),
      );
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / copy when exists
  public __copyWhenExist(relativePath: string, destinations: string[]) {
    //#region @backendFunc
    const absPath = crossPlatformPath([this.project.location, relativePath]);

    for (let index = 0; index < destinations.length; index++) {
      const dest = crossPlatformPath([destinations[index], relativePath]);
      if (Helpers.exists(absPath)) {
        if (Helpers.isFolder(absPath)) {
          Helpers.remove(dest, true);
          Helpers.copy(absPath, dest, { recursive: true });
        } else {
          Helpers.copyFile(absPath, dest);
          if (path.basename(absPath) === config.file.tnpEnvironment_json) {
            Helpers.setValueToJSON(dest, 'currentProjectLocation', void 0);
          }
        }
      } else {
        Helpers.log(`[isomorphic-lib][copyWhenExist] not exists: ${absPath}`);
      }
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / link when exists
  public __linkWhenExist(relativePath: string, destinations: string[]) {
    //#region @backendFunc
    let absPath = path.join(this.project.location, relativePath);

    if (Helpers.exists(absPath) && Helpers.isExistedSymlink(absPath)) {
      absPath = Helpers.pathFromLink(absPath);
    }

    for (let index = 0; index < destinations.length; index++) {
      const dest = crossPlatformPath([destinations[index], relativePath]);
      if (Helpers.exists(absPath)) {
        Helpers.remove(dest, true);
        Helpers.createSymLink(absPath, dest);
      }
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / compile backend es5
  /**
   * TODO not working
   */
  protected __backendCompileToEs5(
    outDir: 'dist',
    mainCliJSFileName = 'index.js',
  ) {
    return;
    //#region @backend
    if (!Helpers.exists(path.join(this.project.location, outDir, 'index.js'))) {
      Helpers.warn(
        `[compileToEs5] Nothing to compile to es5... no index.js in ${outDir}`,
      );
      return;
    }
    const indexEs5js = `index-es5.js`;
    Helpers.writeFile(
      path.join(this.project.location, outDir, config.file._babelrc),
      '{ "presets": ["env"] }\n',
    );
    this.project
      .run(
        `npm-run babel  ./${outDir}/index.js --out-file ./${outDir}/${indexEs5js}`,
      )
      .sync();
    Helpers.writeFile(
      path.join(this.project.location, outDir, config.file.index_js),
      Helpers.readFile(path.join(this.project.location, outDir, indexEs5js)),
    );
    Helpers.removeFileIfExists(
      path.join(this.project.location, outDir, indexEs5js),
    );
    Helpers.removeFileIfExists(
      path.join(this.project.location, outDir, config.file._babelrc),
    );
    //#endregion
  }
  //#endregion

  //#region getters & methods / compile/cliBuildUglify backend code
  private __backendUglifyCode(
    outDir: 'dist',
    reservedNames: string[],
    mainCliJSFileName = 'index.js',
  ) {
    //#region @backendFunc
    if (
      !Helpers.exists(
        path.join(this.project.location, outDir, mainCliJSFileName),
      )
    ) {
      Helpers.warn(
        `[cliBuildUglifyCode] Nothing to cliBuildUglify... no ${mainCliJSFileName} in /${outDir}`,
      );
      return;
    }
    const command =
      `npm-run cliBuildUglifyjs ${outDir}/${mainCliJSFileName} --output ${outDir}/${mainCliJSFileName} -b` +
      ` --mangle reserved=[${reservedNames.map(n => `'${n}'`).join(',')}]`;
    // + ` --mangle-props reserved=[${reservedNames.join(',')}]` // it breakes code

    Helpers.info(`

    JAVASCRIPT-UGLIFY PROCESSING...

    ${command}

      `);
    this.project.run(command).sync();
    //#endregion
  }
  //#endregion

  //#region getters & methods / compile/cliBuildObscure backend code
  private __backendObscureCode(
    outDir: 'dist',
    reservedNames: string[],
    mainCliJSFileName = 'index.js',
  ) {
    //#region @backendFunc
    if (
      !Helpers.exists(
        path.join(this.project.location, config.folder.dist, mainCliJSFileName),
      )
    ) {
      Helpers.warn(
        `[cliBuildObscureCode] Nothing to cliBuildObscure... no ${mainCliJSFileName} in release dist`,
      );
      return;
    }
    const commnad =
      `npm-run javascript-obfuscator dist/${mainCliJSFileName} ` +
      ` --output dist/${mainCliJSFileName}` +
      ` --target node` +
      ` --string-array-rotate true` +
      // + ` --stringArray true`
      ` --string-array-encoding base64` +
      ` --reserved-names '${reservedNames.join(',')}'` +
      ` --reserved-strings '${reservedNames.join(',')}'`;

    Helpers.info(`

        JAVASCRIPT-OBFUSCATOR PROCESSING...

        ${commnad}

          `);
    this.project.run(commnad).sync();
    //#endregion
  }
  //#endregion

  //#region getters & methods / include node_modules in compilation
  private __backendIncludeNodeModulesInCompilation(
    outDir: 'dist',
    cliBuildUglify: boolean,
    mainCliJSFileName: string = config.file.index_js,
  ) {
    //#region @backend

    // QUICK_FIX TODO ncc input change does not work (it takes always index.js)
    //#region QUICK_FIX
    const indexOrg = this.project.pathFor(`${outDir}/${config.file.index_js}`);
    const indexOrgBackup = this.project.pathFor(
      `${outDir}/${config.file.index_js}-backup`,
    );
    const mainFileAbs = this.project.pathFor(`${outDir}/${mainCliJSFileName}`);
    const useBackupFile = mainCliJSFileName !== config.file.index_js;
    if (useBackupFile) {
      Helpers.copyFile(indexOrg, indexOrgBackup);
    }
    //#endregion

    const nccComand = `ncc build ${outDir}/${
      config.file.index_js
    } -o ${outDir}/temp/ncc ${cliBuildUglify ? '-m' : ''}  --no-cache `;
    // console.log({
    //   useBackupFile,
    //   indexOrg,
    //   indexOrgBackup,
    //   nccComand
    // })
    this.project.run(nccComand).sync();
    // Helpers
    //   .filesFrom([this.location, outDir, 'lib'], true)
    //   .filter(f => f.endsWith('.js') || f.endsWith('.js.map'))
    //   .forEach(f => Helpers.removeFileIfExists(f))
    //   ;

    const baseDistRelease = crossPlatformPath(
      path.join(this.project.location, outDir),
    );
    const nccBase = crossPlatformPath(
      path.join(this.project.location, outDir, 'temp', 'ncc'),
    );
    const indexJSPath = crossPlatformPath([nccBase, 'index.js']);
    Helpers.writeFile(
      indexJSPath,
      UtilsQuickFixes.replaceSQLliteFaultyCode(Helpers.readFile(indexJSPath)),
    );

    // copy wasm file for dest
    const wasmfileSource = crossPlatformPath([
      this.project.ins.by(
        'isomorphic-lib',
        this.project.framework.frameworkVersion,
      ).location,
      'app/src/assets/sql-wasm.wasm',
    ]);
    const wasmfileDest = crossPlatformPath([nccBase, 'sql-wasm.wasm']);
    Helpers.copyFile(wasmfileSource, wasmfileDest);

    Helpers.filesFrom(nccBase, true)
      .filter(f => f.replace(`${nccBase}/`, '') !== config.file.package_json)
      .forEach(f => {
        const relativePath = f.replace(`${nccBase}/`, '');
        const dest = crossPlatformPath(
          path.join(baseDistRelease, relativePath),
        );
        Helpers.copyFile(f, dest);
      });

    Helpers.removeFolderIfExists(path.dirname(nccBase));

    // remove dependencies
    const pjPath = this.project.pathFor(
      `${outDir}/${config.file.package_json}`,
    );
    const pj: PackageJson = Helpers.readJson(pjPath);
    Object.keys(pj.dependencies).forEach(name => {
      if (!['ora'].includes(name)) {
        // TODO QUICK FIX FOF TNP
        delete pj.dependencies[name];
      }
    });
    pj.peerDependencies = {};
    pj.devDependencies = {};
    Helpers.removeFileIfExists(pjPath);
    Helpers.writeFile(pjPath, pj);

    if (useBackupFile) {
      Helpers.copyFile(indexOrg, mainFileAbs);
      Helpers.copyFile(indexOrgBackup, indexOrg);
    }
    Helpers.removeIfExists(indexOrgBackup);

    //#endregion
  }
  //#endregion

  //#region getters & methods / include remove dts
  /**
   * @deprecated
   */
  private __backendRemoveDts(outDir: 'dist') {
    //#region @backend
    Helpers.filesFrom([this.project.location, outDir, 'lib'], true)
      .filter(f => f.endsWith('.d.ts'))
      .forEach(f => Helpers.removeFileIfExists(f));
    Helpers.writeFile(
      [this.project.location, outDir, 'lib/index.d.ts'],
      `export declare const dummy${new Date().getTime()};`,
    );
    //#endregion
  }
  //#endregion

  //#region getters & methods / all npm packages names
  get allNpmPackagesNames(): string[] {
    //#region @backendFunc
    return [
      this.project.framework.universalPackageName,
      ...this.project.taonJson.additionalNpmNames,
    ];
    //#endregion
  }
  //#endregion

  //#region getters & methods / build info
  async creteBuildInfoFile(initOptions: InitOptions): Promise<void> {
    //#region @backendFunc
    initOptions = InitOptions.from(initOptions);
    if (this.project.framework.isSmartContainer) {
      this.project.children.forEach(c =>
        c.artifactsManager.artifact.npmLibAndCliTool.creteBuildInfoFile(
          initOptions,
        ),
      );
    } else if (this.project.framework.isStandaloneProject) {
      const dest = this.project.pathFor([
        config.folder.src,
        config.folder.lib,
        config.file.build_info_generated_ts,
      ]);
      Helpers.writeFile(
        dest,
        `
export const BUILD_FRAMEWORK_CLI_NAME = '${config.frameworkName}';

      `,
      );
    }

    //#endregion
  }
  //#endregion

  //#region getters & methods / show message when build lib done for smart container
  public __showMesageWhenBuildLibDoneForSmartContainer(
    buildOptions: BuildOptions,
  ): void {
    //#region @backend
    if (this.project.releaseProcess.isInCiReleaseProject) {
      Helpers.logInfo('Lib build part done...  ');
      return;
    }
    const buildLibDone = `LIB BUILD DONE.. `;
    const ifapp =
      'if you want to start app build -> please run in other terminal command:';

    const ngserveCommand = `${
      buildOptions.watch ? '--port 4201 # or whatever port' : '#'
    } to run angular ${
      buildOptions.watch ? 'ng serve' : 'ng build (for application - not lib)'
    }.`;
    // const bawOrba = buildOptions.watch ? 'baw' : 'ba';
    const bawOrbaLong = buildOptions.watch
      ? ' build:app:watch '
      : ' build:app ';
    const bawOrbaLongWebsql = buildOptions.watch
      ? 'build:app:watch --websql'
      : 'build:app --websql';
    const withPort = '(with custom port - otherwise automatically selected)';
    const orIfWebsql = `or if you want to try websql mode:`;

    if (this.project.framework.isSmartContainerTarget) {
      const parent = this.project.framework.smartContainerTargetParentContainer;
      const smartContainerTargetName =
        buildOptions.smartContainerTargetName ||
        this.project.framework.smartContainerBuildTarget?.name;

      Helpers.taskDone(
        `${chalk.underline(
          `

      ${buildLibDone}... for target project "` +
            `${parent ? parent.name + '/' : ''}${smartContainerTargetName}"`,
        )}`,
      );

      Helpers.success(`

      ${ifapp}

      ${chalk.bold(
        config.frameworkName + bawOrbaLong + smartContainerTargetName,
      )}
      or
      ${config.frameworkName} ${bawOrbaLongWebsql} ${smartContainerTargetName}

            `);
    } else if (this.project.framework.isStandaloneProject) {
      Helpers.taskDone(`${chalk.underline(`${buildLibDone}...`)}`);
      Helpers.success(`

      ${ifapp}

      ${chalk.bold(config.frameworkName + bawOrbaLong)}
      or
      ${config.frameworkName} ${bawOrbaLongWebsql}
      `);
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / build lib or app
  async buildLibOrApp(buildOptions: BuildOptions): Promise<void> {
    //#region @backendFunc

    //#region handle vascode

    if (buildOptions.targetArtifact === 'vscode-plugin') {
      await this.artifact.vscodeExtensionPLugin.__buildVscode(buildOptions);
      return;
    }
    //#endregion

    //#region handle electron
    if (buildOptions.targetArtifact === 'electron-app') {
      await this.artifact.electronApp.buildPartial(buildOptions);
      return;
    }
    //#endregion

    //#region prevent empty taon node_modules
    await this.project.nodeModules.makeSureInstalled();
    //#endregion

    //#region prevent not requested framework version
    if (this.project.framework.frameworkVersionLessThan('v4')) {
      Helpers.error(
        `Please upgrade taon framework version to to at least v4

      ${config.file.taon_jsonc} => version => should be at least 4

      `,
        false,
        true,
      );
    }
    //#endregion

    let libContextExists = false;

    //#region set proper smart container target name
    const smartContainerTargetName =
      buildOptions.smartContainerTargetName ||
      this.project.framework.smartContainerBuildTarget?.name;
    //#endregion

    if (buildOptions.libBuild) {
      //#region save baseHref for lib build
      buildOptions.baseHref = !_.isUndefined(buildOptions.baseHref)
        ? buildOptions.baseHref
        : this.artifact.angularNodeApp.angularFeBasenameManager.rootBaseHref;

      const baseHrefLocProj = this.project;

      baseHrefLocProj.writeFile(
        tmpBaseHrefOverwriteRelPath + (smartContainerTargetName || ''),
        buildOptions.baseHref,
      );
      //#endregion

      //#region create taon context for main lib code build ports assignations
      const projectInfoPort = await this.project.registerAndAssignPort(
        `project-build-info`,
        {
          startFrom: 4100,
        },
      );

      this.project.artifactsManager.artifact.angularNodeApp.__setProjectInfoPort(
        projectInfoPort,
      );
      this.project.artifactsManager.artifact.angularNodeApp.backendPort =
        PortUtils.instance(
          this.project.artifactsManager.artifact.angularNodeApp.projectInfoPort,
        ).calculateServerPortFor(this.project);

      Helpers.writeFile(
        this.project.pathFor(tmpBuildPort),
        projectInfoPort?.toString(),
      );

      const hostForBuild = `http://localhost:${projectInfoPort}`;

      // Taon.destroyContext(hostForBuild);
      if (!buildOptions?.skipProjectProcess) {
        //#region check build message
        console.info(`



      You can check info about build in ${chalk.bold(hostForBuild)}



            `);
        //#endregion

        Helpers.taskStarted(`starting project service... ${hostForBuild}`);

        const ProjectBuildContext = Taon.createContext(() => ({
          contextName: 'ProjectBuildContext',
          host: hostForBuild,
          contexts: { BaseContext },
          controllers: { BuildProcessController },
          entities: { BuildProcess },
          skipWritingServerRoutes: true,
          logs: false,
          database: {
            autoSave: false, // skip creationg db file
          },
        }));
        await ProjectBuildContext.initialize();
        const buildProcessController: BuildProcessController =
          ProjectBuildContext.getClassInstance(BuildProcessController);

        await buildProcessController.initializeServer(this.project);

        libContextExists = true;
      }

      this.project.vsCodeHelpers.__saveLaunchJson(projectInfoPort);
      !buildOptions.skipProjectProcess &&
        Helpers.taskDone('project service started');
      // console.log({ context })
      //#endregion

      //#region normal/watch lib build
      if (buildOptions.watch) {
        await this.initPartial(
          InitOptions.fromBuild(
            buildOptions.clone({
              watch: true,
              purpose: 'lib watch build init',
            }),
          ),
        );
      } else {
        await this.initPartial(
          InitOptions.fromBuild(
            buildOptions.clone({ watch: false, purpose: 'lib build init' }),
          ),
        );
      }
      //#endregion
    }

    if (buildOptions.appBuild) {
      // TODO is this ok baw is not initing ?

      //#region prevent empty baseHref for app build
      if (
        !_.isUndefined(buildOptions.baseHref) &&
        buildOptions.buildType === 'app'
      ) {
        Helpers.error(
          `Build baseHref only can be specify when build lib code:

        try commands:
        ${config.frameworkName} start --base-href ${buildOptions.baseHref} # it will do lib and app code build
        ${config.frameworkName} build:watch --base-href ${buildOptions.baseHref} # it will do lib code build

        `,
          false,
          true,
        );
      }

      const baseHrefLocProj = this;

      const fromFileBaseHref = Helpers.readFile(
        baseHrefLocProj.project.pathFor(
          tmpBaseHrefOverwriteRelPath + (smartContainerTargetName || ''),
        ),
      );
      buildOptions.baseHref = fromFileBaseHref;
      //#endregion

      //#region create taon context for for client app remote connection to build server
      if (!libContextExists) {
        const projectInfoPortFromFile = Number(
          Helpers.readFile(this.project.pathFor(tmpBuildPort)),
        );
        console.log({
          projectInfoPortFromFile,
        });
        this.project.artifactsManager.artifact.angularNodeApp.__setProjectInfoPort(
          projectInfoPortFromFile,
        );

        const hostForAppWorker = `http://localhost:${projectInfoPortFromFile}`;
        // console.log({ hostForAppWorker })
        if (!buildOptions?.skipProjectProcess) {
          const ProjectBuildContext = Taon.createContext(() => ({
            contextName: 'ProjectBuildContext',
            remoteHost: hostForAppWorker,
            contexts: { BaseContext },
            controllers: { BuildProcessController },
            entities: { BuildProcess },
            skipWritingServerRoutes: true,
            logs: false,
            database: {
              autoSave: false, // probably not needed here
            },
          }));
          await ProjectBuildContext.initialize();
          const buildProcessController: BuildProcessController =
            ProjectBuildContext.getClassInstance(BuildProcessController);

          await buildProcessController.initializeClientToRemoteServer(
            this.project,
          );
        }
      }
      //#endregion

      //#region prevent empty node_modules
      if (this.project.nodeModules.empty) {
        Helpers.error(
          `Please start lib build first:

        ${config.frameworkName} build:watch # short -> ${config.frameworkName} bw
or use command:

${config.frameworkName} start

        `,
          false,
          true,
        );
      }
      //#endregion
    }

    Helpers.logInfo(`

    Building lib for base href: ${
      !_.isUndefined(buildOptions.baseHref)
        ? `'` + buildOptions.baseHref + `'`
        : '/ (default)'
    }

    `);

    //#region build assets file
    /**
     * Build assets file for app in app build mode
     */
    const buildAssetsFile = async (): Promise<void> => {
      // console.log('after build steps');

      const shouldGenerateAssetsList =
        this.project.framework.isSmartContainer ||
        (this.project.framework.isStandaloneProject &&
          !this.project.framework.isSmartContainerTarget);
      // console.log({ shouldGenerateAssetsList });
      if (shouldGenerateAssetsList) {
        if (buildOptions.watch) {
          await this.project.artifactsManager.artifact.angularNodeApp.__assetsFileListGenerator.startAndWatch(
            this.project.framework.smartContainerBuildTarget?.name,
            buildOptions.outDir,
            buildOptions.websql,
          );
        } else {
          await this.project.artifactsManager.artifact.angularNodeApp.__assetsFileListGenerator.start(
            this.project.framework.smartContainerBuildTarget?.name,
            buildOptions.outDir,
            buildOptions.websql,
          );
        }
      }
    };
    //#endregion

    //#region start copy to manager function
    const startCopyToManager = async () => {
      // console.info('starting copy manager');
      Helpers.info(`${buildOptions.watch ? 'files watch started...' : ''}`);
      Helpers.log(
        `[buildable-project] Build steps ended (project type: ${this.project.type}) ... `,
      );

      if (
        buildOptions.buildType == 'lib' ||
        buildOptions.buildType == 'lib-app'
      ) {
        if (
          (this.project.framework.isStandaloneProject &&
            this.project.typeIs('isomorphic-lib')) ||
          this.project.framework.isSmartContainer
        ) {
          // // console.log('after build steps')
          this.artifact.npmLibAndCliTool.__copyManager.init(buildOptions);
          const taskName = 'copyto manger';
          if (buildOptions.watch) {
            await this.project.artifactsManager.artifact.npmLibAndCliTool.__copyManager.startAndWatch(
              { taskName },
            );
          } else {
            await this.project.artifactsManager.artifact.npmLibAndCliTool.__copyManager.start(
              { taskName },
            );
          }
        }
      }
    };
    //#endregion

    //#region start build
    const libBuildDone = async () => {
      if (buildOptions.appBuild) {
        await buildAssetsFile();
      }
      const shouldStartCopyToManager =
        buildOptions.libBuild && !buildOptions.skipCopyManager;
      // console.log('Should start copy to manager', { shouldStartCopyToManager });
      if (shouldStartCopyToManager) {
        await startCopyToManager();
      }
    };
    // console.log('before build steps')
    await this.__buildSteps(buildOptions, libBuildDone);
    //#endregion

    //#region show end lib build info
    !buildOptions.skipCopyManager &&
      Helpers.info(
        buildOptions.watch
          ? `
    [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
    Files watcher started.. ${buildOptions.websql ? '[WEBSQL]' : ''}
  `
          : `
    [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
    End of Building ${this.project.genericName} ${buildOptions.websql ? '[WEBSQL]' : ''}

  `,
      );
    //#endregion

    buildOptions.finishCallback();
    //#endregion
  }
  //#endregion

  //#region  build steps
  async __buildSteps(buildOptions?: BuildOptions, libBuildDone?: () => void) {
    //#region @backendFunc

    if (this.project.framework.isSmartContainer) {
      //#region use proxy project to build smart container
      if (!fse.existsSync(this.project.location)) {
        return;
      }
      let { smartContainerTargetName } = buildOptions;

      let targetProj = this.project.artifactsManager.globalHelper.targetProjFor(
        smartContainerTargetName ||
          this.project.framework.smartContainerBuildTarget?.name,
      );
      // if (targetProj.isNotInitedProject) {
      //   await targetProj.init('before taget before building smart container');
      // }
      await targetProj.artifactsManager.artifact.npmLibAndCliTool.__buildSteps(
        buildOptions,
        libBuildDone,
      );
      //#endregion
    }
    if (this.project.framework.isStandaloneProject) {
      if (buildOptions.libBuild) {
        await this.artifact.npmLibAndCliTool.__buildLib(buildOptions);
      }
      await Helpers.runSyncOrAsync({ functionFn: libBuildDone, context: this });
      if (buildOptions.appBuild) {
        await this.artifact.angularNodeApp.buildApp(buildOptions);
      }
    }
    //#endregion
  }
  //#endregion
}
