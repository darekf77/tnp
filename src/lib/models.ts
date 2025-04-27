import { CoreModels, _ } from 'tnp-core/src';
import { PackageJson } from 'type-fest';

import type { ReleaseType } from './options';
import type { Project } from './project/abstract/project';

export namespace Models {
  //#region taon test type
  export type TestTypeTaon = 'mocha' | 'jest' | 'cypress';
  export const TestTypeTaonArr = ['mocha', 'jest', 'cypress'] as TestTypeTaon[];
  //#endregion

  //#region taon fe app loader
  export interface TaonLoaderConfig {
    name?: TaonLoaders;
    color?: string;
  }

  export type TaonLoaders =
    | 'lds-default'
    | 'lds-ellipsis'
    | 'lds-facebook'
    | 'lds-grid'
    | 'lds-heart'
    | 'lds-ripple';
  //#endregion

  //#region site option
  /**
   * @deprecated
   */
  export type NewSiteOptions = {
    type?: CoreModels.NewFactoryType;
    name?: string;
    cwd?: string;
    basedOn?: string;
    version?: CoreModels.FrameworkVersion;
    skipInit?: boolean;
    alsoBasedOn?: string[];
    siteProjectMode?: 'strict' | 'dependency';
  };
  //#endregion

  //#region cli root args
  // TODO make it more visible
  export type RootArgsType = {
    tnpNonInteractive: boolean;
    tnpShowProgress: boolean;
    tnpNoColorsMode: boolean;
    findNearestProject: boolean;
    findNearestProjectWithGitRoot: boolean;
    findNearestProjectType: CoreModels.LibType;
    findNearestProjectTypeWithGitRoot: CoreModels.LibType;
    cwd: string;
  };
  //#endregion

  //#region generate project copy
  export interface GenerateProjectCopyOpt {
    override?: boolean;
    markAsGenerated?: boolean;
    regenerateOnlyCoreProjects?: boolean;
    forceCopyPackageJSON?: boolean;
    filterForReleaseDist?: boolean;
    showInfo?: boolean;
    ommitSourceCode?: boolean;
    regenerateProjectChilds?: boolean;
    useTempLocation?: boolean;
    /**
     * copy links as folders and files
     */
    dereference?: boolean;
  }
  //#endregion

  //#region ps list info
  export interface PsListInfo {
    pid: number;
    ppid: number;
    memory: number;
    cpu: number;
    name: string;
    cmd: string;
  }
  //#endregion

  //#region create json schema options
  export interface CreateJsonSchemaOptions {
    project: Project;
    nameOfTypeOrInterface: string;
    relativePathToTsFile: string;
  }
  //#endregion

  //#region taon json
  export interface TaonAutoReleaseItem {
    artifactName:
      | 'npm-lib-and-cli-tool'
      | 'angular-node-app'
      | 'electron-app'
      | 'mobile-app'
      | 'vscode-plugin'
      | 'docs-webapp';
    // | ReleaseArtifactTaon; // TODO this alone should be enough but parese crate invalid schema
    /**
     * if not proviede default  env.<artifact-name>.__.ts will be in use
     */
    envName?:
      | 'localhost'
      | 'dev'
      | 'stage'
      | 'prod'
      | 'test'
      | 'qa'
      | 'sandbox'
      | 'uat'
      | 'preprod'
      | 'demo'
      | 'docs'
      | 'static-pages'
      | 'ci'
      | 'training';
    // CoreModels.EnvironmentNameTaon; // TODO this alone should be enough but parser creates invalid schema
    /**
     * example for dev environtment
     * > undefined - env.<artifact-name>.dev.ts
     * > 1 - env.<artifact-name>.dev1.ts
     * > 2 - env.<artifact-name>.dev2.ts
     * ...
     */
    envNumber?: number | undefined;
    /**
     * skip release of this artifact
     */
    skip?: boolean;
    /**
     * select release type for automatic release
     */
    releaseType?: ReleaseType;
  }

  export interface TaonJsonStandalone extends TaonJsonCommon {
    /**
     * override npm name for build/relese
     */
    overrideNpmName?: string;

    /**
     * it override name of project when is inside container that
     * is organization.
     *
     * Property "overrideNpmName" can override this name.
     */
    overrideNameWhenInsideOrganization?: string;

    /**
     * override name of cli tool created from project
     */
    overrideNameForCli?: string;

    type: 'isomorphic-lib';
    /**
     * Static resurces for standalone project, that are
     * going to be included in release dist
     */
    resources?: string[];

    /**
     * At beginning after node_modules installation taon is checking is
     * packages are installed - if not it will throw error.
     * Also.. this dependencies are going to be included in released npm lib
     * as dependencies.
     */
    dependenciesNamesForNpmLib: string[];

    /**
     * At beginning after node_modules installation taon is checking is
     * packages are installed - if not it will throw error.
     * Also.. this peerDependencies are going to be included in released npm lib
     * as peerDependencies.
     */
    peerDependenciesNamesForNpmLib: string[];

    /**
     * so I can release same npm lib
     * with different name
     * @deprecated does not make sense
     */
    additionalNpmNames?: string[];

    /**
     * Project is using own node_modules instead of core container
     */
    isUsingOwnNodeModulesInsteadCoreContainer?: boolean;

    /**
     * @deprecated
     * use isUsingOwnNodeModulesInsteadCoreContainer
     */
    usesItsOwnNodeModules?: boolean;

    /**
     * generate src/lib/index._auto-generated_.ts with
     * all exports from lib ts files
     */
    shouldGenerateAutogenIndexFile: boolean;

    /**
     * Auto release helps with releasing multiple projects from a local machine.
     * This is useful when we don't have Taon Cloud set up and want to release
     * all projects with a single command.
     */
    autoReleaseConfigAllowedItems?: TaonAutoReleaseItem[];
  }

  export interface TaonJsonContainer extends TaonJsonCommon {
    type: 'container';

    /**
     * Static resurces for site project, that are
     * going to be included in release dist
     */
    resources?: string[];

    /**
     * Project is monorepo
     */
    monorepo?: boolean;

    /**
     * Project is organization/scope (like @angular)
     */
    organization?: boolean;

    /**
     * Container projects can be used as micro frontends
     * with router:
     *  <site-path>/  (microFrontendMainProjectName)
     *  <site-path>/_/other-project-name
     */
    microFrontendMainProjectName?: string;
  }

  interface TaonJsonCommon {
    /**
     * version of taon framework for project
     */
    version?: CoreModels.FrameworkVersion;

    /**
     * project is template for other project
     */
    isCoreProject: boolean;
    packageJsonOverride: Partial<PackageJson>;

    /**
     * @deprecated
     */
    overrided?: {
      /**
       * @deprecated
       */
      includeOnly?: string[];
    };
  }

  export type TaonJson = TaonJsonCommon &
    (TaonJsonStandalone | TaonJsonContainer);
  //#endregion

  //#region DocsConfig
  export interface DocsConfig {
    /**
     * override site name (default is project name)
     */
    site_name: string;
    /**
     * relative pathes (or titles) of md files
     * for proper order
     */
    priorityOrder?: string[];
    /**
     * glob pattern to omit files by title
     */
    omitFilesPatters: string[];
    /**
     * relative path to the assets folders in project
     * [external assets not allowed... use externalDocs for that]
     */
    // additionalAssets: string[];
    /**
     * include external docs
     * inside this docs
     */
    externalDocs: {
      mdfiles: {
        /**
         * path to *.md file
         * Examples:
         * taon-core/README.md
         * taon-core/docs/README.md # deep pathes allowed
         */
        packageNameWithPath: string;
        /**
         * if you want to rename something inside file
         * you can use this magic rename rules
         * example:
         *
         * framework-name => new-framework-name
         *
         * example with array:
         *
         * framework-name => new-framework-name, framework-name2 => new-framework-name2
         */
        magicRenameRules?: string;
        /**
         * override menu item name (by default titile is relative path)         *
         */
        overrideTitle?: string;
      }[];
      projects: {
        /**
         * default README.md file
         * If array -> file will be join and first file will be used as title
         */
        packageNameWithPath?: string | string[];
        /**
         * override menu item name
         */
        overrideTitle?: string;
      }[];
    };
    /**
     * rename/override titles in menu, exmaple:
     * README.md => Home
     */
    mapTitlesNames: {
      [title: string]: string;
    };
    customJsPath?: string;
    customCssPath?: string;
  }
  //#endregion
}
