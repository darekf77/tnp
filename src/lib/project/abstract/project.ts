//#region imports
import { config } from 'tnp-config/src';
import { fse, os, requiredForDev } from 'tnp-core/src';
import { child_process } from 'tnp-core/src';
import { _, crossPlatformPath, path, CoreModels } from 'tnp-core/src';
import { Helpers, BaseProject } from 'tnp-helpers/src';

import {
  BuildOptions,
  ClearOptions,
  InitOptions,
  ReleaseOptions,
} from '../../options';

import { ArtifactManager } from './artifacts/artifacts-manager';
import { Framework } from './framework';
import { Git } from './git';
import { LibraryBuild } from './library-build';
import { LinkedProjects } from './linked-projects';
import { Linter } from './linter';
import { NodeModules } from './node-modules';
import { NpmHelpers } from './npm-helpers';
import { PackageJSON } from './package-json';
import { PackagesRecognition } from './packages-recognition';
import { TaonProjectResolve } from './project-resolve';
import { QuickFixes } from './quick-fixes';
import type { ReleaseProcess } from './release-process';
import { TaonJson } from './taonJson';
import { Vscode } from './vscode';
//#endregion

//@ts-ignore
export class Project extends BaseProject<Project, CoreModels.LibType> {
  //#region static

  //#region static / instance of resolve
  static ins = new TaonProjectResolve(Project, global.frameworkName);
  //#endregion

  //#endregion

  //#region fields
  public readonly type: CoreModels.LibType;
  public readonly vsCodeHelpers: Vscode;

  // @ts-ignore TODO weird inheritance problem
  public readonly releaseProcess?: ReleaseProcess;

  // @ts-ignore TODO weird inheritance problem
  public readonly npmHelpers: NpmHelpers;

  // @ts-ignore TODO weird inheritance problem
  get packageJson(): PackageJSON {
    return this.npmHelpers.packageJson as any;
  }

  // @ts-ignore TODO weird inheritance problem
  get nodeModules(): NodeModules {
    return this.npmHelpers.nodeModules as any;
  }

  public readonly linter: Linter;
  public readonly framework: Framework;

  // @ts-ignore TODO weird inheritance problem
  public readonly quickFixes: QuickFixes;
  public readonly artifactsManager: ArtifactManager;
  public readonly git: Git;
  public readonly taonJson: TaonJson;
  public readonly packagesRecognition: PackagesRecognition;

  //#endregion

  //#region constructor
  //#region @backend
  constructor(location?: string) {
    super(crossPlatformPath(_.isString(location) ? location : ''));
    this.taonJson = new TaonJson(this);

    this.setType(this.taonJson.type || 'unknown');

    this.framework = new Framework(this);

    this.git = new (require('./git').Git as typeof Git)(this as any);

    this.libraryBuild = new (require('./library-build')
      .LibraryBuild as typeof LibraryBuild)(this as any) as any;

    this.npmHelpers = new (require('./npm-helpers')
      .NpmHelpers as typeof NpmHelpers)(this);

    this.linkedProjects = new (require('./linked-projects')
      .LinkedProjects as typeof LinkedProjects)(this as any);

    this.vsCodeHelpers = new (require('./vscode').Vscode as typeof Vscode)(
      this,
    );

    this.releaseProcess = new (require('./release-process')
      .ReleaseProcess as typeof ReleaseProcess)(this);

    this.quickFixes = new (require('./quick-fixes')
      .QuickFixes as typeof QuickFixes)(this);

    this.linter = new (require('./linter').Linter as typeof Linter)(this);

    this.packagesRecognition = new PackagesRecognition(this);

    this.artifactsManager = ArtifactManager.for(this);

    Project.ins.add(this);
  }
  //#endregion
  //#endregion

  //#region api / struct
  async struct(initOptions?: InitOptions): Promise<void> {
    initOptions = InitOptions.from(initOptions);

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
  async init(initOptions?: InitOptions): Promise<void> {
    initOptions = InitOptions.from(initOptions);

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.init(initOptions);
    }
    if (this.framework.isContainer) {
      await this.artifactsManager.init(initOptions);
      await this.artifactsManager.initAllChildren(initOptions);
    }

    if (!initOptions.watch) {
      initOptions.finishCallback();
    }
  }
  //#endregion

  //#region api / build
  async build(buildOptions?: BuildOptions): Promise<void> {
    buildOptions = BuildOptions.from(buildOptions);

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.build(buildOptions);
    }
    if (this.framework.isContainer) {
      await this.artifactsManager.build(buildOptions);
      await this.artifactsManager.buildAllChildren(buildOptions);
    }

    if (!buildOptions.watch && !!buildOptions.targetArtifact) {
      buildOptions.finishCallback();
    }
  }
  //#endregion

  //#region api / release
  public async release(releaseOptions: ReleaseOptions): Promise<void> {
    releaseOptions = ReleaseOptions.from(releaseOptions);

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.release(releaseOptions);
    }
    if (this.framework.isContainer) {
      await this.artifactsManager.releaseAllChildren(releaseOptions);
      await this.artifactsManager.release(releaseOptions);
    }

    releaseOptions.finishCallback();
  }
  //#endregion

  //#region api / lint
  async lint(lintOptions?: any) {
    // TODO
  }
  //#endregion

  //#region api / clear
  public async clear(options: ClearOptions) {
    // TODO
  }
  //#endregion

  //#region taon relative projects paths
  /**
   * @deprecated
   */
  get tnpCurrentCoreContainer(): Project {
    return this.ins.From(
      this.pathFor(
        `../taon/projects/container-${this.framework.frameworkVersion}`,
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
    return this.packageJson
      ? this.packageJson.name
      : path.basename(this.location);
    //#endregion
  }
  //#endregion

  //#region info
  async info(): Promise<void> {
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

    console.info(`

    name: ${this.name}
    basename: ${this.basename}
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
    should dedupe packages ${this.nodeModules.shouldDedupePackages}

    genericName: ${this.genericName}
    universalPackageName: ${this.framework.universalPackageName}

    frameworkVersion: ${this.framework.frameworkVersion}
    type: ${this.type}
    parent name: ${this.parent && this.parent.name}
    grandpa name: ${this.grandpa && this.grandpa.name}
    git origin: ${this.git.originURL}
    git branch name: ${this.git.currentBranchName}
    git commits number: ${this.git.countComits()}

    location: ${this.location}

    children (${(this.children || []).length}):
${children}

    linked projects (${(this.linkedProjects.linkedProjects || []).length}):
${linkedProjects}

    git children (${(this.git.gitChildren || []).length}):
${gitChildren}

    `);

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
}
