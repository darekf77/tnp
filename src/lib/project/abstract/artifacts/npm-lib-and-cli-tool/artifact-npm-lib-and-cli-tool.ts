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
  UtilsTerminal,
} from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { BasePackageJson, Helpers, UtilsQuickFixes } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  COMPILATION_COMPLETE_LIB_NG_BUILD,
  DEFAULT_PORT,
  MESSAGES,
  tmpBaseHrefOverwriteRelPath,
} from '../../../../constants';
import { EnvOptions, ReleaseType } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../base-artifact';

import { IncrementalBuildProcess } from './tools/build-isomorphic-lib/compilations/incremental-build-process';
import { CopyManager } from './tools/copy-manager/copy-manager';
import {
  FilesRecreator,
  FilesTemplatesBuilder,
} from './tools/files-recreation';
import { IndexAutogenProvider } from './tools/index-autogen-provider';
import { InsideStructuresLib } from './tools/inside-structures/inside-structures';
import { LibProjectStandalone } from './tools/lib-project/lib-project-standalone';
import { CypressTestRunner } from './tools/test-runner/cypress-test-runner';
import { JestTestRunner } from './tools/test-runner/jest-test-runner';
import { MochaTestRunner } from './tools/test-runner/mocha-test-runner';
//#endregion

export class ArtifactNpmLibAndCliTool extends BaseArtifact<
  {
    //#region build output options
    /**
     * for non org: <path-to-release-folder>/tmp-local-temp-proj/my-library/node_modules/my-library
     * for org: <path-to-release-folder>/tmp-local-temp-proj/my-library/node_modules/@my-library
     */
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    /**
     * check if produced package is an organization package
     * (this can be from standalone with custom name OR container organization)
     */
    isOrganizationPackage?: boolean;
    /**
     * my-library or @my-library/my-inside-lib or @my-library/my-inside-lib/deep-core-lib
     */
    packageName?: string;
    //#endregion
  },
  {
    //#region release output options
    releaseProjPath: string;
    releaseType: ReleaseType;
    //#endregion
  }
> {
  //#region fields

  public readonly __libStandalone: LibProjectStandalone;

  public readonly __tests: MochaTestRunner;
  public readonly __testsJest: JestTestRunner;
  public readonly __testsCypress: CypressTestRunner;

  public readonly filesRecreator: FilesRecreator;

  public readonly copyNpmDistLibManager: CopyManager;
  public readonly insideStructureLib: InsideStructuresLib;
  protected readonly indexAutogenProvider: IndexAutogenProvider;
  public readonly filesTemplatesBuilder: FilesTemplatesBuilder;

  //#endregion

  //#region constructor
  //#region @backend
  constructor(project: Project) {
    super(project, 'npm-lib-and-cli-tool');

    this.__libStandalone = new LibProjectStandalone(project);

    this.__tests = new MochaTestRunner(project);
    this.__testsJest = new JestTestRunner(project);
    this.__testsCypress = new CypressTestRunner(project);

    this.copyNpmDistLibManager = CopyManager.for(project);
    this.indexAutogenProvider = new IndexAutogenProvider(project);
    this.filesTemplatesBuilder = new FilesTemplatesBuilder(project);
    this.filesRecreator = new FilesRecreator(project);
    this.insideStructureLib = new InsideStructuresLib(project);
  }
  //#endregion
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc

    Helpers.taskStarted(
      `Initing project: ${chalk.bold(this.project.genericName)} ${
        initOptions.init.struct ? '(without packages install)' : ''
      } `,
    );

    await this.filesRecreator.init();

    this.filesRecreator.vscode.settings.toogleHideOrShowDeps();

    await this.project.environmentConfig.init();

    if (this.project.framework.isStandaloneProject) {
      await this.insideStructureLib.init(initOptions);
      this.filesTemplatesBuilder.rebuild(initOptions);
    }

    if (!initOptions.init.struct) {
      await this.project.nodeModules.makeSureInstalled();
    }

    if (this.project.framework.isStandaloneProject) {
      this.project.quickFixes.addMissingSrcFolderToEachProject();
      this.project.quickFixes.missingAngularLibFiles();
    }

    if (this.project.framework.isContainerCoreProject) {
      this.project.quickFixes.createDummyEmptyLibsReplacements([]); // TODO
      this.project.quickFixes.removeBadTypesInNodeModules();
    }

    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask(
        {
          watch: initOptions.build.watch,
        },
      );
      await this.creteBuildInfoFile(initOptions);
      if (this.indexAutogenProvider.generateIndexAutogenFile) {
        await this.indexAutogenProvider.runTask({
          watch: initOptions.build.watch,
        });
      } else {
        this.indexAutogenProvider.writeIndexFile(true);
      }
    }

    Helpers.log(
      `Init DONE for project: ${chalk.bold(this.project.genericName)} `,
    );

    this.project.quickFixes.makeSureDistFolderExists();

    // Helpers.info(`[buildLib] start of building ${websql ? '[WEBSQL]' : ''}`);

    this.copyEssentialFilesTo([
      crossPlatformPath([this.project.pathFor(config.folder.dist)]),
    ]);

    //#endregion
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    isOrganizationPackage?: boolean;
    packageName?: string;
  }> {
    //#region @backendFunc
    if (!this.project.framework.isStandaloneProject) {
      return;
    }

    await this.initPartial(EnvOptions.fromBuild(buildOptions));
    const packageName = this.project.nameForNpmPackage;
    const tmpProjNpmLibraryInNodeModulesAbsPath = this.project.pathFor(
      `tmp-local-copyto-proj-${config.folder.dist}/` +
        `${config.folder.node_modules}/` +
        `${packageName}`,
    );
    const isOrganizationPackage =
      this.project.nameForNpmPackage.startsWith('@');

    Helpers.log(`[buildLib] start of building...`);

    //#region init incremental process
    const incrementalBuildProcess = new IncrementalBuildProcess(
      this.project,
      buildOptions.clone({
        build: {
          websql: false,
        },
      }),
    );

    const incrementalBuildProcessWebsql = new IncrementalBuildProcess(
      this.project,
      buildOptions.clone({
        build: {
          websql: true,
          genOnlyClientCode: true,
        },
      }),
    );
    //#endregion

    //#region init proxy projects
    const proxyProject =
      this.project.artifactsManager.globalHelper.getProxyNgProj(
        buildOptions.clone({
          build: {
            websql: false,
          },
        }),
        'lib',
      );

    const proxyProjectWebsql =
      this.project.artifactsManager.globalHelper.getProxyNgProj(
        buildOptions.clone({
          build: {
            websql: true,
          },
        }),
        'lib',
      );
    Helpers.log(`

    proxy Proj = ${proxyProject?.location}
    proxy Proj websql = ${proxyProjectWebsql?.location}

    `);
    //#endregion

    //#region prepare commands + base href
    // const command = `${loadNvm} && ${this.npmRunNg} build ${this.name} ${watch ? '--watch' : ''}`;
    const commandForLibraryBuild = `${this.NPM_RUN_NG_COMMAND} build ${this.project.name} ${
      buildOptions.build.watch ? '--watch' : ''
    }`;

    const showInfoAngular = () => {
      Helpers.info(
        `Starting browser Angular/TypeScirpt build.... ${
          buildOptions.build.websql ? '[WEBSQL]' : ''
        }`,
      );
      Helpers.log(`

      ANGULAR ${this.project.ins.Tnp?.packageJson.version} ${
        buildOptions.build.watch ? 'WATCH ' : ''
      } LIB BUILD STARTED... ${buildOptions.build.websql ? '[WEBSQL]' : ''}

      `);

      Helpers.log(` command: ${commandForLibraryBuild}`);
    };

    buildOptions.build.baseHref = !_.isUndefined(buildOptions.build.baseHref)
      ? buildOptions.build.baseHref
      : this.artifacts.angularNodeApp.angularFeBasenameManager.rootBaseHref;

    this.project.writeFile(
      tmpBaseHrefOverwriteRelPath,
      buildOptions.build.baseHref,
    );

    Helpers.logInfo(`

      Building lib for base href: ${
        !_.isUndefined(buildOptions.build.baseHref)
          ? `'` + buildOptions.build.baseHref + `'`
          : '/ (default)'
      }

      `);
    //#endregion

    if (
      !buildOptions.build.watch &&
      buildOptions.release.cutNpmPublishLibReleaseCode
    ) {
      this.__cutReleaseCodeFromSrc(buildOptions);
    }

    //#region incremental build
    await incrementalBuildProcess.runTask({
      taskName: 'isomorphic compilation',
      watch: buildOptions.build.watch,
    });
    await incrementalBuildProcessWebsql.runTask({
      taskName: 'isomorphic compilation [WEBSQL]',
      watch: buildOptions.build.watch,
    });
    //#endregion

    showInfoAngular();

    //#region ng build
    const runNgBuild = async () => {
      await proxyProject.execute(commandForLibraryBuild, {
        similarProcessKey: 'ng',
        resolvePromiseMsg: {
          stdout: buildOptions.build.watch
            ? COMPILATION_COMPLETE_LIB_NG_BUILD
            : undefined,
        },
        ...this.sharedOptions(buildOptions),
      });
      await proxyProjectWebsql.execute(commandForLibraryBuild, {
        similarProcessKey: 'ng',
        resolvePromiseMsg: {
          stdout: buildOptions.build.watch
            ? COMPILATION_COMPLETE_LIB_NG_BUILD
            : undefined,
        },
        ...this.sharedOptions(buildOptions),
      });
    };
    //#endregion

    //#region  handle watch & normal mode
    if (buildOptions.build.watch) {
      await runNgBuild();
    } else {
      try {
        await runNgBuild();
      } catch (e) {
        console.error(e);

        Helpers.throw(
          `
          Command failed: ${commandForLibraryBuild}

          Not able to build project: ${this.project.genericName}`,
        );
      }
    }
    //#endregion

    if (buildOptions.release.cutNpmPublishLibReleaseCode) {
      this.__restoreCuttedReleaseCodeFromSrc(buildOptions);
    }

    //#region start copy manager
    if (!buildOptions.copyToManager.skip) {
      this.copyNpmDistLibManager.init(buildOptions);
      await this.copyNpmDistLibManager.runTask({
        taskName: 'copyto manger',
        watch: buildOptions.build.watch,
      });
    }
    //#endregion

    //#region show ending info
    this.showMesageWhenBuildLibDone(buildOptions);

    Helpers.info(
      buildOptions.build.watch
        ? `
     [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
     Files watcher started.. ${buildOptions.build.websql ? '[WEBSQL]' : ''}
   `
        : `
     [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
     End of Building ${this.project.genericName} ${buildOptions.build.websql ? '[WEBSQL]' : ''}

   `,
    );
    //#endregion

    return {
      tmpProjNpmLibraryInNodeModulesAbsPath,
      isOrganizationPackage,
      packageName,
    };
    //#endregion
  }
  //#endregion

  //#region release partial
  async releasePartial(releaseOptions: EnvOptions): Promise<{
    releaseProjPath: string;
    releaseType: ReleaseType;
  }> {
    //#region @backendFunc

    //#region prepare variables
    let releaseType: ReleaseType = releaseOptions.release.releaseType;

    const {
      isOrganizationPackage,
      packageName,
      tmpProjNpmLibraryInNodeModulesAbsPath,
    } = await this.buildPartial(
      EnvOptions.fromRelease({
        ...releaseOptions,
        // copyToManager: {
        //   skip: true,
        // },
      }),
    );
    let releaseProjPath: string = tmpProjNpmLibraryInNodeModulesAbsPath;
    //#endregion

    const newVersion = this.project.packageJson.resolvePossibleNewVersion(
      releaseOptions.release.releaseVersionBumpType,
    );

    this.project.packageJson.setVersion(newVersion);

    this.removeNotNpmReleatedFilesFromReleaseBundle(
      tmpProjNpmLibraryInNodeModulesAbsPath,
    );
    this.copyEssentialFilesTo([tmpProjNpmLibraryInNodeModulesAbsPath]);

    this.packResource(tmpProjNpmLibraryInNodeModulesAbsPath);
    this.createClientVersionAsCopyOfBrowser(
      tmpProjNpmLibraryInNodeModulesAbsPath,
    );

    this.preparePackageJsonForReleasePublish(
      tmpProjNpmLibraryInNodeModulesAbsPath,
    );

    await this.runAfterReleaseJsCodeActions(
      tmpProjNpmLibraryInNodeModulesAbsPath,
      releaseOptions,
    );

    const projFromCompiled = this.project.ins.From(
      tmpProjNpmLibraryInNodeModulesAbsPath,
    );

    if (
      await projFromCompiled.releaseProcess.publishToNpm(
        tmpProjNpmLibraryInNodeModulesAbsPath,
        releaseOptions.release.autoReleaseUsingConfig,
      )
    ) {
      await this.copyNpmDistLibManager.runTask({
        taskName: 'copyto manger release action',
      });
      await this.project.git.tagAndPushToGitRepo(newVersion, releaseOptions);
    }

    return { releaseProjPath, releaseType };
    //#endregion
  }
  //#endregion

  //#region clear
  async clearPartial(options?: EnvOptions): Promise<void> {
    // TODO make it better
    rimraf.sync(this.project.pathFor('dist') + '*');
    rimraf.sync(this.project.pathFor('tmp') + '*');
  }
  /**
   * TODO
   * @param options
   * @returns
   */
  async clearLib(options: EnvOptions) {
    //#region @backendFunc
    Helpers.taskStarted(`Cleaning project: ${this.project.genericName}`);

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

    if (options.recursiveAction) {
      for (const child of this.project.children) {
        await child.clear(options);
      }
    }
    //#endregion
  }

  //#endregion

  //#region private methods

  //#region private methods / run after release js code actions
  private async runAfterReleaseJsCodeActions(
    releaseAbsPath: string,
    releaseOptions: EnvOptions,
  ): Promise<void> {
    //#region cli
    if (releaseOptions.release.cli.includeNodeModules) {
      await this.project.nodeModules.removeOwnPackage(async () => {
        await this.backendIncludeNodeModulesInCompilation(
          releaseAbsPath,
        );
      });
    }

    const reservedNames = ['reservedExpSec', 'reservedExpOne'];

    if (releaseOptions.release.cli.uglify) {
      await this.backendMinifyCode({
        releaseAbsPath,
        strategy: 'cli-only',
        reservedNames,
      });
    }

    if (releaseOptions.release.cli.obscure) {
      await this.backendObscureCode({
        releaseAbsPath,
        strategy: 'cli-only',
        reservedNames,
      });
    }
    //#endregion

    //#region lib
    if (releaseOptions.release.lib.removeDts) {
      await this.backendReleaseRemoveDts(releaseAbsPath);
    }

    if (releaseOptions.release.lib.uglifyFileByFile) {
      await this.backendMinifyCode({
        releaseAbsPath,
        strategy: 'lib-only',
        reservedNames,
      });
    }

    if (releaseOptions.release.lib.obscureFileByFile) {
      await this.backendObscureCode({
        releaseAbsPath,
        strategy: 'lib-only',
        reservedNames,
      });
    }
    //#endregion

    // await this.backendRemoveJsMapsFrom(releaseAbsPath);
  }

  //#endregion

  //#region private methods / prepare package json for release publish
  private preparePackageJsonForReleasePublish(relaseAbsPath: string): void {
    //#region @backendFunc
    const pathInRelease = crossPlatformPath([
      relaseAbsPath,
      config.file.package_json,
    ]);
    Helpers.copyFile(this.project.packageJson.path, pathInRelease);
    const pj = new BasePackageJson({
      cwd: relaseAbsPath,
    });
    const dependencies = pj.dependencies;
    pj.setDependencies({});
    if (this.project.taonJson.dependenciesNamesForNpmLib) {
      pj.setDependencies(
        this.project.taonJson.dependenciesNamesForNpmLib.reduce((a, b) => {
          return { ...a, [b]: dependencies[b] };
        }, {}),
      );
    }
    if (this.project.taonJson.peerDependenciesNamesForNpmLib) {
      pj.setPeerDependencies(
        this.project.taonJson.peerDependenciesNamesForNpmLib.reduce((a, b) => {
          return { ...a, [b]: dependencies[b] };
        }, {}),
      );
    }
    //#endregion
  }
  //#endregion

  //#region private methods / remove not npm releated files from release bundle
  private removeNotNpmReleatedFilesFromReleaseBundle(
    relaseAbsPath: string,
  ): void {
    //#region @backendFunc
    Helpers.remove(`${relaseAbsPath}/app*`); // QUICK_FIX
    Helpers.remove(`${relaseAbsPath}/tests*`); // QUICK_FIX
    Helpers.remove(`${relaseAbsPath}/src`, true); // QUICK_FIX
    // Helpers.removeFileIfExists(`${relaseAbsPath}/source`);

    // regenerate src.d.ts
    Helpers.writeFile(
      crossPlatformPath([relaseAbsPath, 'src.d.ts']),
      `
// THIS FILE IS GENERATED
export * from './lib';
// THIS FILE IS GENERATED
// please use command: taon build:watch to see here links for your globally builded lib code files
// THIS FILE IS GENERATED
    `.trimStart(),
    );

    //#endregion
  }

  //#endregion

  //#region private methods / fix terminal output paths
  private async sharedOptions(buildOptions: EnvOptions): Promise<any> {
    return {
      // askToTryAgainOnError: true,
      exitOnErrorCallback: async code => {
        if (buildOptions.release.releaseType) {
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
        if (this.project.framework.isStandaloneProject) {
          if (line.startsWith('WARNING: postcss-url')) {
            return ' --- [taon] IGNORED WARN ---- ';
          }

          line = line.replace(`projects/${this.project.name}/src/`, `./src/`);

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
  }
  //#endregion

  //#region private methods / pack resources
  private packResource(releaseDistFolder: string): void {
    //#region @backendFunc
    if (!fse.existsSync(releaseDistFolder)) {
      fse.mkdirSync(releaseDistFolder);
    }

    [...this.project.taonJson.resources].forEach(res => {
      //  copy resource to org build and copy shared assets
      const file = path.join(this.project.location, res);
      const dest = path.join(releaseDistFolder, res);

      if (!fse.existsSync(file)) {
        throw new Error(
          `[${config.frameworkName}][lib-project] Resource file: ${chalk.bold(
            path.basename(file),
          )} does not ` +
            `exist in "${this.project.genericName}"  (package.json > resources[])
        `,
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

  //#region private methods / create client folder from browser folder
  private createClientVersionAsCopyOfBrowser(releaseDestAbsPath: string): void {
    //#region @backendFunc
    const browser = path.join(releaseDestAbsPath, config.folder.browser);
    const client = path.join(releaseDestAbsPath, config.folder.client);
    Helpers.remove(client);
    if (fse.existsSync(browser)) {
      Helpers.copy(browser, client, { recursive: true });
    }
    //#endregion
  }
  //#endregion

  //#region private methods / copy essential files
  private copyEssentialFilesTo(toDestinations: string[]): void {
    //#region @backendFunc
    this.copyWhenExist('bin', toDestinations);
    // this.copyWhenExist(config.file.taon_jsonc, toDestinations);
    this.copyWhenExist('.npmrc', toDestinations);
    this.copyWhenExist('.npmignore', toDestinations);
    this.copyWhenExist('.gitignore', toDestinations);
    this.copyWhenExist(config.file.tnpEnvironment_json, toDestinations);
    //#endregion
  }
  //#endregion

  //#region private methods / copy when exists
  private copyWhenExist(relativePath: string, destinations: string[]): void {
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

  //#region private methods / link when exists
  private linkWhenExist(relativePath: string, destinations: string[]): void {
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

  //#region private methods / compile/cliBuildUglify backend code
  private backendMinifyCode(options: {
    strategy: 'lib-and-cli' | 'cli-only' | 'lib-only';
    releaseAbsPath: string;
    reservedNames: string[];
  }): void {
    //#region @backendFunc
    const { strategy, releaseAbsPath, reservedNames } = options;
    const cliJsPath = crossPlatformPath([releaseAbsPath, 'cli.js']);

    const files =
      strategy === 'cli-only'
        ? [cliJsPath]
        : [
            ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
            ...Helpers.filesFrom([releaseAbsPath, 'lib'], true).filter(f =>
              f.endsWith('.js'),
            ),
          ];

    for (const fileAbsPath of files) {
      const uglifiedTempPath = crossPlatformPath([
        path.dirname(fileAbsPath),
        path.basename(fileAbsPath).replace('.js', '') + '.min.js',
      ]);
      const command =
        `npm-run uglifyjs ${fileAbsPath} --output ` +
        `${uglifiedTempPath} -b` +
        ` --mangle reserved=[${reservedNames.map(n => `'${n}'`).join(',')}]`;
      // + ` --mangle-props reserved=[${reservedNames.join(',')}]` // it breakes code
      this.project.run(command, { biggerBuffer: false }).sync();
      Helpers.removeFileIfExists(fileAbsPath);
      Helpers.copyFile(uglifiedTempPath, fileAbsPath);
      Helpers.removeFileIfExists(uglifiedTempPath);
    }

    //#endregion
  }
  //#endregion

  //#region private methods / compile/cliBuildObscure backend code
  private backendObscureCode(options: {
    strategy: 'lib-and-cli' | 'cli-only' | 'lib-only';
    releaseAbsPath: string;
    reservedNames: string[];
  }): void {
    //#region @backendFunc
    const { strategy, releaseAbsPath, reservedNames } = options;
    const cliJsPath = crossPlatformPath([releaseAbsPath, 'cli.js']);

    const files =
      strategy === 'cli-only'
        ? [cliJsPath]
        : [
            ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
            ...Helpers.filesFrom([releaseAbsPath, 'lib'], true).filter(f =>
              f.endsWith('.js'),
            ),
          ];

    for (const fileAbsPath of files) {
      const uglifiedTempPath = crossPlatformPath([
        path.dirname(fileAbsPath),
        path.basename(fileAbsPath).replace('.js', '') + '.min.js',
      ]);
      const command =
        `npm-run javascript-obfuscator ${fileAbsPath} ` +
        ` --output ${uglifiedTempPath}` +
        ` --target node` +
        ` --string-array-rotate true` +
        // + ` --stringArray true`
        ` --string-array-encoding base64` +
        ` --reserved-names '${reservedNames.join(',')}'` +
        ` --reserved-strings '${reservedNames.join(',')}'`;

      this.project.run(command, { biggerBuffer: false }).sync();
      Helpers.removeFileIfExists(fileAbsPath);
      Helpers.copyFile(uglifiedTempPath, fileAbsPath);
      Helpers.removeFileIfExists(uglifiedTempPath);
    }

    //#endregion
  }
  //#endregion

  //#region getters & methods / remove (m)js.map files from release
  /**
   * because of that
   * In vscode there is a mess..
   * TODO
   */
  private async backendRemoveJsMapsFrom(
    absPathReleaseDistFolder: string,
  ): Promise<void> {
    //#region @backendFunc
    Helpers.filesFrom([absPathReleaseDistFolder, 'lib'], true)
      .filter(f => f.endsWith('.js.map') || f.endsWith('.mjs.map'))
      .forEach(f => Helpers.removeFileIfExists(f));

    Helpers.removeFileIfExists([absPathReleaseDistFolder, 'cli.js.map']);
    //#endregion
  }
  //#endregion

  //#region private methods / include remove dts
  /**
   * remove dts files from release
   */
  private async backendReleaseRemoveDts(
    releseFolderAbsPath: string,
  ): Promise<void> {
    //#region @backendFunc

    Helpers.filesFrom([releseFolderAbsPath, 'lib'], true)
      .filter(f => f.endsWith('.d.ts'))
      .forEach(f => Helpers.removeFileIfExists(f));

    Helpers.removeFileIfExists([releseFolderAbsPath, 'cli.d.ts']);

    Helpers.writeFile(
      [releseFolderAbsPath, 'lib/index.d.ts'],
      `export declare const dummy${new Date().getTime()};`,
    );
    //#endregion
  }
  //#endregion

  //#region private methods / build info
  private async creteBuildInfoFile(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    initOptions = EnvOptions.from(initOptions);
    if (this.project.framework.isStandaloneProject) {
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

  //#region private methods / show message when build lib done for smart container
  private showMesageWhenBuildLibDone(buildOptions: EnvOptions): void {
    //#region @backendFunc
    if (buildOptions.release.releaseType) {
      Helpers.logInfo('Lib build part done...  ');
      return;
    }
    const buildLibDone = `LIB BUILD DONE.. `;
    const ifapp =
      'if you want to start app build -> please run in other terminal command:';

    // const bawOrba = buildOptions.watch ? 'baw' : 'ba';
    const bawOrbaLong = buildOptions.build.watch
      ? ' build:app:watch '
      : ' build:app ';
    const bawOrbaLongWebsql = buildOptions.build.watch
      ? 'build:app:watch --websql'
      : 'build:app --websql';

    Helpers.taskDone(`${chalk.underline(`${buildLibDone}...`)}`);
    Helpers.success(`

      ${ifapp}

      ${chalk.bold(config.frameworkName + bawOrbaLong)}
      or
      ${config.frameworkName} ${bawOrbaLongWebsql}
      `);

    //#endregion
  }
  //#endregion

  //#region private methods / include node_modules in compilation
  async backendIncludeNodeModulesInCompilation(
    releaseAbsLocation: string,
  ): Promise<void> {
    //#region @backendFunc

    const destCli = crossPlatformPath([releaseAbsLocation, 'index.js']);
    const destCliMin = crossPlatformPath([releaseAbsLocation, 'cli.js']);

    await Helpers.ncc(destCli, destCliMin);

    // copy wasm file for dest
    const wasmfileSource = crossPlatformPath([
      this.project.ins.by(
        'isomorphic-lib',
        this.project.framework.frameworkVersion,
      ).location,
      'app/src/assets/sql-wasm.wasm',
    ]);

    const wasmfileDest = crossPlatformPath([
      releaseAbsLocation,
      'sql-wasm.wasm',
    ]);
    Helpers.copyFile(wasmfileSource, wasmfileDest);

    const destStartJS = crossPlatformPath([releaseAbsLocation, 'bin/start.js']);
    Helpers.writeFile(
      destStartJS,
      `console.log('<<< USING BUNDLED CLI >>>');` +
        `\n${Helpers.readFile(destStartJS)}`,
    );

    Helpers.writeFile(
      crossPlatformPath([releaseAbsLocation, 'CLI-README.md']),
      `# ${this.project.name} CLI\n\n
    ## Installation as global tool
    \`\`\`bash
    npm link
    \`\`\`
    `,
    );
    //#endregion
  }
  //#endregion

  //#endregion
}
