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
  async struct() {
    // TODO
  }
  //#endregion

  //#region api / init
  async init(initOptions?: InitOptions): Promise<void> {
    // TODO
  }
  //#endregion

  //#region api / build
  async build(buildOptions?: BuildOptions) {
    // TODO
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

  //#region api / release
  public async release(releaseOptions: ReleaseOptions) {}
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

  //#region generic name
  /**
   * @overload
   */
  public get genericName(): string {
    //#region @backendFunc
    if (this.typeIs('unknown')) {
      return;
    }
    if (!_.isNil(this.cache['genericName'])) {
      this.cache['genericName'];
    }

    let result = [];
    if (this.framework.isSmartContainerTarget) {
      // result = [
      //   this.smartContainerTargetParentContainer.name,
      //   this.name,
      // ]
      result = result.concat(
        this.framework.smartContainerTargetParentContainer.parentsNames,
      );
    } else {
      result = result.concat(this.parentsNames);
    }

    if (this.framework.isSmartContainerTarget) {
      result.push(this.framework.smartContainerTargetParentContainer.name);
    }
    result.push(this.name);
    const res = result
      .filter(f => !!f)
      .join('/')
      .trim();
    if (_.isNil(this.cache['genericName'])) {
      this.cache['genericName'] = res;
    }
    return this.cache['genericName'];
    //#endregion
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
    isSmartContainer: ${this.framework.isSmartContainer}
    isSmartContainerChild: ${this.framework.isSmartContainerChild}
    isSmartContainerTarget: ${this.framework.isSmartContainerTarget}
    isSmartContainerTargetNonClient: ${this.framework.isSmartContainerTargetNonClient}
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

`);
    //       + `
    //     children (${this.children?.length || 0}):
    // ${(this.children || []).map(c => '- ' + c.packageJson.name).join('\n')}

    //     linked porject prefix: "${this.linkedProjectsPrefix || ''}"

    //     linked projects from json (${this.linkedProjects?.length || 0}):
    // ${(this.linkedProjects || []).map(c => '- ' + c.relativeClonePath).join('\n')}

    //     linked projects detected (${this.detectedLinkedProjects?.length || 0}):
    // ${(this.detectedLinkedProjects || []).map(c => '- ' + c.relativeClonePath).join('\n')}

    //     `
    // }
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
    if (this.pathExists('taon.json')) {
      const taonChildren = Helpers.foldersFrom(this.location)
        .filter(
          f =>
            !f.startsWith('.') &&
            ![config.folder.node_modules].includes(path.basename(f)),
        )
        .map(f => Project.ins.From(f) as Project)
        .filter(f => !!f);
      // console.log({
      //   taonChildren: taonChildren.map(c => c.location)
      // })
      return taonChildren;
    }

    /**
     * TODO QUICK_FIX
     */
    if (this.framework.isTnp && !global.globalSystemToolMode) {
      return [];
    }
    if (this.typeIs('unknown')) {
      return [];
    }
    const all = this.getAllChildren();
    // console.log({
    //   all: all.map(c => c.location)
    // })
    return all;
    //#endregion
  }
  //#endregion
}
