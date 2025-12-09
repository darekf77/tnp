//#region imports
import { config } from 'tnp-core/src';
import { chalk, fse, os, requiredForDev } from 'tnp-core/src';
import { child_process } from 'tnp-core/src';
import { _, crossPlatformPath, path, CoreModels } from 'tnp-core/src';
import { Helpers, BaseProject } from 'tnp-helpers/src';

import { EnvOptions, ReleaseType } from '../../options';

import { EnvironmentConfig } from './artifacts/__helpers__/environment-config/environment-config';
import { ArtifactManager } from './artifacts/artifacts-manager';
import { FileFoldersOperations } from './file-folders-operations';
import { Framework } from './framework';
import { Git } from './git';
import { IgnoreHide } from './ignore-hide';
import { LibraryBuild } from './library-build';
import { LinkedProjects } from './linked-projects';
import { Linter } from './linter';
import { NodeModules } from './node-modules';
import { NpmHelpers } from './npm-helpers';
import { PackageJSON } from './package-json';
import { PackagesRecognition } from './packages-recognition';
import { TaonProjectResolve } from './project-resolve';
import { QuickFixes } from './quick-fixes';
import { Refactor } from './refactor';
import type { ReleaseProcess } from './release-process';
import { TaonJson } from './taonJson';
import { Vscode } from './vscode-helper';
import { UtilsTerminal } from 'tnp-core/src';
import e from 'express';

//#endregion
let frameworkName = '';
//#region @backend
frameworkName = global.frameworkName;
//#endregion

// @ts-ignore TODO weird inheritance problem
export class Project extends BaseProject<Project, CoreModels.LibType> {
  //#region static

  //#region static / instance of resolve
  static ins = new TaonProjectResolve(Project, frameworkName);
  //#endregion

  //#endregion

  //#region fields
  // @ts-ignore TODO weird inheritance problem
  public readonly type: CoreModels.LibType;
  // @ts-ignore TODO weird inheritance problem
  public readonly vsCodeHelpers: Vscode;

  // @ts-ignore TODO weird inheritance problem
  public readonly releaseProcess: ReleaseProcess;

  // @ts-ignore TODO weird inheritance problem
  public readonly npmHelpers: NpmHelpers;

  get packageJson(): PackageJSON {
    return this.npmHelpers.packageJson as any;
  }
  // @ts-ignore TODO weird inheritance problem
  get nodeModules(): NodeModules {
    return this.npmHelpers.nodeModules as any;
  }
  // @ts-ignore TODO weird inheritance problem
  public readonly linter: Linter;
  public readonly framework: Framework;

  // @ts-ignore TODO weird inheritance problem
  public readonly quickFixes: QuickFixes;
  public readonly artifactsManager: ArtifactManager;
  // @ts-ignore TODO weird inheritance problem
  public readonly git: Git;
  // @ts-ignore TODO weird inheritance problem
  public readonly ignoreHide: IgnoreHide;
  public readonly taonJson: TaonJson;
  public readonly packagesRecognition: PackagesRecognition;
  public readonly environmentConfig: EnvironmentConfig;

  public readonly refactor: Refactor;

  //#endregion

  //#region constructor
  //#region @backend
  constructor(location?: string) {
    super(crossPlatformPath(_.isString(location) ? location : ''));
    this.taonJson = new TaonJson(this);

    this.setType(this.taonJson.type || 'unknown');

    this.framework = new Framework(this);

    this.git = new (require('./git').Git as typeof Git)(this as any);

    this.ignoreHide = new (require('./ignore-hide')
      .IgnoreHide as typeof IgnoreHide)(this as any);

    this.fileFoldersOperations = new (require('./file-folders-operations')
      .FileFoldersOperations as typeof FileFoldersOperations)(this as any);

    this.libraryBuild = new (require('./library-build')
      .LibraryBuild as typeof LibraryBuild)(this as any) as any;

    this.npmHelpers = new (require('./npm-helpers')
      .NpmHelpers as typeof NpmHelpers)(this);

    this.linkedProjects = new (require('./linked-projects')
      .LinkedProjects as typeof LinkedProjects)(this as any);

    this.vsCodeHelpers = new (require('./vscode-helper')
      .Vscode as typeof Vscode)(this);

    this.releaseProcess = new (require('./release-process')
      .ReleaseProcess as typeof ReleaseProcess)(this);

    this.quickFixes = new (require('./quick-fixes')
      .QuickFixes as typeof QuickFixes)(this);

    this.linter = new (require('./linter').Linter as typeof Linter)(this);

    this.packagesRecognition = new PackagesRecognition(this);

    this.artifactsManager = ArtifactManager.for(this);

    this.environmentConfig = new EnvironmentConfig(this);

    this.refactor = new Refactor(this);
    Project.ins.add(this);
  }
  //#endregion
  //#endregion

  //#region api / struct
  async struct(initOptions?: EnvOptions): Promise<void> {
    initOptions = EnvOptions.from(initOptions);

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.struct(initOptions);
    }
    if (this.framework.isContainer) {
      await this.artifactsManager.struct(initOptions);
      await this.artifactsManager.structAllChildren(initOptions);
    }

    initOptions.finishCallback();
  }
  //#endregion

  //#region api / init
  async init(initOptions?: EnvOptions): Promise<void> {
    initOptions = EnvOptions.from(initOptions);

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.init(initOptions);
    }
    if (this.framework.isContainer) {
      await this.artifactsManager.init(initOptions);
      if (initOptions.recursiveAction) {
        await this.artifactsManager.initAllChildren(initOptions);
      }
    }

    if (!initOptions.build.watch) {
      initOptions.finishCallback();
    }
  }
  //#endregion

  //#region api / build
  async build(buildOptions?: EnvOptions): Promise<void> {
    buildOptions = EnvOptions.from(buildOptions);

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.build(buildOptions);
    }
    if (this.framework.isContainer) {
      buildOptions.build.watch = false; // there is no need to watch for container ever
      await this.artifactsManager.build(buildOptions);
      if (buildOptions.recursiveAction) {
        await this.artifactsManager.buildAllChildren(buildOptions);
      }
    }

    if (!buildOptions.build.watch && !!buildOptions.release.targetArtifact) {
      buildOptions.finishCallback();
    }
  }
  //#endregion

  //#region api / release
  public async release(releaseOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    releaseOptions = EnvOptions.from(releaseOptions);

    const endCallback = (): void => {
      releaseOptions.finishCallback && releaseOptions.finishCallback();
    };

    if (
      this.framework.isStandaloneProject &&
      !this.hasValidAutoReleaseConfig(releaseOptions)
    ) {
      endCallback();
      return;
    }

    await this.npmHelpers.checkProjectReadyForNpmRelease();
    if (
      releaseOptions.release.targetArtifact === 'npm-lib-and-cli-tool' &&
      releaseOptions.release.releaseType !== 'local' &&
      releaseOptions.release.releaseType !== 'static-pages'
    ) {
      await this.npmHelpers.makeSureLoggedInToNpmRegistry();
    }

    const newVersion = this.packageJson.resolvePossibleNewVersion(
      releaseOptions.release.releaseVersionBumpType,
    );

    //#region prepare release children
    let children = releaseOptions.release.autoReleaseUsingConfig
      ? this.children.filter(
          f =>
            f.taonJson.autoReleaseConfigAllowedItems.length > 0 ||
            (f.framework.isContainer && f.taonJson.createOnlyTagWhenRelease),
        )
      : this.children;

    // console.log('before sorting ',children.map(c => c.name));

    if (this.framework.isContainer) {
      if (this.taonJson.createOnlyTagWhenRelease) {
        Helpers.warn(
          `Container project is set to only create git tag during release process.` +
            `No releases will be done inside children projects.`,
        );
        this.packageJson.setVersion(newVersion);
        await Helpers.git.tagAndPushToGitRepo(this.location, {
          newVersion,
          autoReleaseUsingConfig: releaseOptions.release.autoReleaseUsingConfig,
          isCiProcess: releaseOptions.isCiProcess,
          skipTag: false,
        });
        endCallback();
        return;
      }

      children = this.ins // @ts-ignore BaseProject inheritace compatiblity with Project problem
        .sortGroupOfProject<Project>(
          children,
          proj => [
            ...proj.taonJson.dependenciesNamesForNpmLib,
            ...proj.taonJson.isomorphicDependenciesForNpmLib,
            ...proj.taonJson.peerDependenciesNamesForNpmLib,
          ],
          proj => proj.nameForNpmPackage,
        )
        .filter(
          d =>
            d.framework.isStandaloneProject ||
            (d.framework.isContainer && d.taonJson.createOnlyTagWhenRelease),
        );

      if (releaseOptions.container.only.length > 0) {
        children = children.filter(c => {
          return releaseOptions.container.only.includes(c.name);
        });
      }

      if (releaseOptions.container.skip.length > 0) {
        children = children.filter(c => {
          return !releaseOptions.container.skip.includes(c.name);
        });
      }

      const endIndex = children.findIndex(
        c => c.name === releaseOptions.container.end,
      );
      if (endIndex !== -1) {
        children = children.filter((c, i) => {
          return i <= endIndex;
        });
      }

      const startIndex = children.findIndex(
        c => c.name === releaseOptions.container.start,
      );
      if (startIndex !== -1) {
        children = children.filter((c, i) => {
          return i >= startIndex;
        });
      }

      if (releaseOptions.container.skipReleased) {
        children = children.filter((c, i) => {
          const lastCommitMessage = c?.git?.lastCommitMessage()?.trim();
          return !lastCommitMessage?.startsWith('release: ');
        });
      }
    }

    if (releaseOptions.release.autoReleaseUsingConfig) {
      children = children.filter(child => {
        if (!child.framework.isStandaloneProject) {
          return true;
        }
        const hasConfigForAutoRelease = child.hasValidAutoReleaseConfig(
          releaseOptions,
          { project: child, hideTaskErrors: true },
        );
        return hasConfigForAutoRelease;
      });
    }

    // console.log('after sorting ',children.map(c => c.name));
    //#endregion

    //#region question about release
    if (!releaseOptions.isCiProcess) {
      Helpers.clearConsole();
    }
    if (
      !(await this.npmHelpers.shouldReleaseMessage({
        releaseVersionBumpType: releaseOptions.release.releaseVersionBumpType,
        versionToUse: newVersion,
        children: children as any,
        whatToRelease: {
          itself: this.framework.isStandaloneProject,
          children: this.framework.isContainer,
        },
        skipQuestionToUser:
          (this.framework.isStandaloneProject &&
            releaseOptions.release.autoReleaseUsingConfig) ||
          releaseOptions.release.skipReleaseQuestion,
        messagePrefix: `${releaseOptions.release.releaseType}-release`,
      }))
    ) {
      return;
    }
    //#endregion

    //#region resolve taon instances
    if (
      (['manual', 'cloud'] as ReleaseType[]).includes(
        releaseOptions.release.releaseType,
      ) &&
      releaseOptions.release.targetArtifact === 'angular-node-app'
    ) {
      if (releaseOptions.release.autoReleaseUsingConfig) {
        // use from config
      } else {
        const ctrl =
          await this.ins.taonProjectsWorker.instancesWorker.getRemoteControllerFor(
            {
              methodOptions: {
                calledFrom: 'Project.release',
              },
            },
          );

        const instances = (await ctrl.getEntities().request())?.body.json || [];
        const options = instances.map(i => ({
          name: `${i.name} (${i.ipAddress})`,
          value: i.ipAddress,
        }));
        releaseOptions.release.taonInstanceIp = await UtilsTerminal.select({
          choices: options,
          autocomplete: true,
          question: `[${releaseOptions.release.releaseType}-release] Select to what instance you want to release`,
        });
      }

      console.log(
        chalk.gray(
          `You selected to release to instance: ${releaseOptions.release.taonInstanceIp}`,
        ),
      );
    }
    //#endregion

    //#region resolve git changes

    if (!releaseOptions.release.skipTagGitPush) {
      if (!releaseOptions.isCiProcess) {
        Helpers.clearConsole();
      }
      if (this.framework.isStandaloneProject) {
        if (!releaseOptions.release.skipResolvingGitChanges) {
          await this.git.resolveLastChanges({
            tryAutomaticActionFirst:
              releaseOptions.release.autoReleaseUsingConfig,
          });
        }
      }
      if (this.framework.isContainer) {
        if (!releaseOptions.release.skipResolvingGitChanges) {
          for (const child of children) {
            if (!releaseOptions.isCiProcess) {
              Helpers.clearConsole();
            }
            Helpers.info(
              `Checking if project has any unfinished/uncommitted git changes: ${child.name}`,
            );
            await child.git.resolveLastChanges({
              tryAutomaticActionFirst:
                releaseOptions.release.autoReleaseUsingConfig,
              projectNameAsOutputPrefix: child.name,
            });
          }
        }
      }
    }
    if (!releaseOptions.isCiProcess) {
      Helpers.clearConsole();
    }
    //#endregion

    //#region actual release process

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.tryCatchWrapper(async () => {
        await this.artifactsManager.release(releaseOptions);
      }, 'release');
    }
    if (this.framework.isContainer) {
      await this.artifactsManager.releaseAllChildren(releaseOptions, children);
    }
    //#endregion

    endCallback();
    //#endregion
  }
  //#endregion

  //#region api / lint
  async lint(lintOptions?: any) {
    // TODO
  }
  //#endregion

  //#region api / clear
  public async clear(clearOptions?: Partial<EnvOptions>) {
    clearOptions = EnvOptions.from(clearOptions);
    await this.artifactsManager.clear(clearOptions as EnvOptions);
    if (clearOptions.recursiveAction) {
      await this.artifactsManager.clearAllChildren(clearOptions as EnvOptions);
    }
  }
  //#endregion

  protected hasValidAutoReleaseConfig(
    envOptions: EnvOptions,
    options?: {
      project?: Project;
      hideTaskErrors?: boolean;
    },
  ): boolean {
    //#region @backendFunc
    options = options || {};
    const project = options.project || this;

    if (!envOptions.release.autoReleaseTaskName) {
      Helpers.error(
        `When using auto releae config (from taon.json) you have to provide task name as argument.`,
        false,
        true,
      );
    }

    const task = project.taonJson.autoReleaseConfigAllowedItems.find(
      i => i.taskName === envOptions.release.autoReleaseTaskName,
    );
    const taskNames = project.taonJson.autoReleaseConfigAllowedItems
      .filter(f => f.taskName)
      .map(i => i.taskName);

    if (!task) {
      if (!options.hideTaskErrors) {
        Helpers.error(
          `Auto release task name: "${envOptions.release.autoReleaseTaskName}" is not ` +
            `present in project auto release configuration.` +
            ` Available task names are: ${taskNames.join(', ')}`,
          true,
          true,
        );
      }
      return false;
    }
    const regexContainerOnlySmallLettersAndDash = /^[a-z\-]+$/;
    if (regexContainerOnlySmallLettersAndDash.test(task.taskName) === false) {
      if (!options.hideTaskErrors) {
        Helpers.error(
          `

            invalid item ${chalk.bold(task.taskName)} in "autoReleaseConfigAllowedItems" in taon.json

            ${chalk.bold('taskName')} can contains only small letters and dash(-).

            Current value: "${chalk.bold(task.taskName)}"

            `,
          true,
          true,
        );
      }
      return false;
    }
    return true;

    //#endregion
  }

  // get env(): EnvOptions  //
  //   return this.environmentConfig.config;
  // }

  get branding() {
    return this.artifactsManager.globalHelper.branding;
  }

  //#region taon relative projects paths
  /**
   * @deprecated
   */
  get tnpCurrentCoreContainer(): Project {
    return this.ins.From(
      this.pathFor(
        `${this.ins.taonProjectsRelative}/container-${this.framework.frameworkVersion}`,
      ),
    );
  }

  //#endregion

  //#region name
  /**
   * @overload
   */
  public get name(): string {
    //#region @backendFunc
    if (this.typeIs('unknown-npm-project')) {
      if (
        this.packageJson.name !== path.basename(this.location) &&
        path.basename(path.dirname(this.location)) === 'external'
      ) {
        return path.basename(this.location);
      }
    }
    return path.basename(this.location);
    //#endregion
  }
  //#endregion

  get nameForCli(): string {
    if (this.taonJson.overrideNameForCli) {
      return this.taonJson.overrideNameForCli;
    }
    return this.name;
  }

  //#region name for npm package
  /**
   * @overload
   */
  get nameForNpmPackage(): string {
    //#region @backendFunc
    if (
      this.framework.isStandaloneProject &&
      this.parent?.framework?.isContainer &&
      this.parent?.taonJson.isOrganization
    ) {
      let nameWhenInOrganization = this.taonJson.nameWhenInsideOrganiation
        ? this.taonJson.nameWhenInsideOrganiation
        : this.name;

      nameWhenInOrganization = this.taonJson.overrideNpmName
        ? this.taonJson.overrideNpmName
        : nameWhenInOrganization;

      return `@${this.parent.name}/${nameWhenInOrganization}`;
    }
    return this.taonJson.overrideNpmName
      ? this.taonJson.overrideNpmName
      : this.name;
    //#endregion
  }
  //#endregion

  //#region info
  async info(): Promise<string> {
    //#region @backendFunc
    const children = (this.children || [])
      .map(c => '- ' + c.genericName)
      .join('\n');

    const linkedProjects = (this.linkedProjects.linkedProjects || [])
      .map(c => '- ' + c.relativeClonePath)
      .join('\n');

    const gitChildren = (this.git.gitChildren || [])
      .map(c => '- ' + c.genericName)
      .join('\n');

    return `

    name: ${this.name}
    basename: ${this.basename}
    nameForNpmPackage: ${this.nameForNpmPackage}
    has node_modules :${!this.nodeModules.empty}
    uses it own node_modules: ${this.taonJson.isUsingOwnNodeModulesInsteadCoreContainer}
    version: ${this.packageJson.version}
    private: ${this.packageJson?.isPrivate}
    monorepo: ${this.isMonorepo}
    parent: ${this.parent?.name}
    grandpa: ${this.grandpa?.name}
    children: ${this.children.length}
    core container location: ${this.framework.coreContainer?.location}
    core project location: ${this.framework.coreProject?.location}

    isStandaloneProject: ${this.framework.isStandaloneProject}
    isCoreProject: ${this.framework.isCoreProject}
    isContainer: ${this.framework.isContainer}
    isOrganization: ${this.taonJson.isOrganization}
    should dedupe packages ${this.nodeModules.shouldDedupePackages}

    genericName: ${this.genericName}

    frameworkVersion: ${this.framework.frameworkVersion}
    type: ${this.type}
    parent name: ${this.parent && this.parent.name}
    grandpa name: ${this.grandpa && this.grandpa.name}
    git origin: ${this.git.originURL}
    git branch name: ${this.git.currentBranchName}
    git commits number: ${this.git.countCommits()}

    location: ${this.location}

    children (${(this.children || []).length}):
${children}

    linked projects (${(this.linkedProjects.linkedProjects || []).length}):
${linkedProjects}

    git children (${(this.git.gitChildren || []).length}):
${gitChildren}

    `;

    //#endregion
  }
  //#endregion

  //#region ins
  /**
   * @overload
   */
  public get ins(): TaonProjectResolve {
    return Project.ins;
  }
  //#endregion

  //#region children
  /**
   * @overload
   */
  get children(): Project[] {
    //#region @backendFunc
    if (this.pathExists(config.file.taon_jsonc)) {
      const folders = Helpers.foldersFrom(this.location).filter(
        f =>
          crossPlatformPath(f) !== crossPlatformPath(this.location) &&
          !path.basename(f).startsWith('.') &&
          !path.basename(f).startsWith('__') &&
          !path.basename(f).startsWith(config.folder.dist) &&
          !path.basename(f).startsWith(config.folder.src) &&
          !path.basename(f).startsWith(config.folder.bin) &&
          !path.basename(f).startsWith(config.folder.docs) &&
          !path.basename(f).startsWith('tmp') &&
          ![config.folder.node_modules].includes(path.basename(f)),
      );
      // console.log({ folders });
      const taonChildren = folders
        .map(f => this.ins.From(f) as Project)
        .filter(f => !!f);
      // console.log({
      //   taonChildren: taonChildren.map(c => c.location)
      // })
      return taonChildren;
    }
    return [];
    //#endregion
  }
  //#endregion

  //#region is monorepo
  get isMonorepo(): boolean {
    return this.taonJson?.isMonorepo;
  }
  //#endregion
}
