import { CoreModels, LibTypeEnum, _ } from 'tnp-core/src';
import { PackageJson } from 'tnp-helpers/src';

import type { ReleaseArtifactTaon, ReleaseType } from './options';
import type { globaLoaders } from './project/abstract/artifacts/__helpers__/inside-structures/structs/loaders/loaders';
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

  export type TaonLoaders = keyof typeof globaLoaders;
  //#endregion

  //#region site option
  export type NewSiteOptions = {
    name?: string;
    cwd?: string;
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

  export class TaonContext {
    contextName: string;

    fileRelativePath: string;
  }

  //#region taon json
  export interface TaonAutoReleaseItem {
    artifactName: ReleaseArtifactTaon;

    /**
     * if not proviede default  env.<artifact-name>.__.ts will be in use
     */
    envName?: CoreModels.EnvironmentName;
    /**
     * example for dev environtment
     * > undefined - env.<artifact-name>.dev.ts
     * > 1 - env.<artifact-name>.dev1.ts
     * > 2 - env.<artifact-name>.dev2.ts
     * ...
     */
    envNumber?: number | undefined;
    /**
     * select release type for automatic release
     */
    releaseType?: ReleaseType;
    /**
     * IP address of taon instance where to release
     */
    taonInstanceIp?: string;
    /**
     * friendly name of item in auto release list configuration
     */
    taskName: string;
    /**
     * Short description of auto release item
     */
    description?: string;
  }

  export type TaonArtifactInclude = ReleaseArtifactTaon[] | '*'; // for each artifact

  export interface TscCompileOptions {
    watch?: boolean;
    generateDeclarations?: boolean;
    tsExe?: string;
    diagnostics?: boolean;
    hideErrors?: boolean;
    debug?: boolean;
  }

  export interface TaonJsonStandalone extends TaonJsonCommon {
    /**
     * (STANDALONE) override npm name for build/relese
     */
    overrideNpmName?: string;

    /**
     * (STANDALONE) Application ID for standalone project.
     * This is used to identify the application inside application stores,
     */
    appId?: string;

    /**
     * (STANDALONE) Number of contexts for this project. (default 2)
     * Number can't be less than 2.
     * This property tells taon how many ports/variables needs to be assigned
     * inside app.hosts.ts
     */
    numberOfContexts?: number;

    /**
     * (STANDALONE) it override name of project when is inside container that
     * is organization.
     *
     * Property "overrideNpmName" can override this name.
     */
    overrideNameWhenInsideOrganization?: string;

    /**
     * (STANDALONE) override name of cli tool created from project
     */
    overrideNameForCli?: string;

    /**
     * (STANDALONE) Static resurces for standalone project, that are
     * going to be included in release dist
     */
    resources?: string[];

    /**
     * (STANDALONE) Base url for content (docs, md files etc.)
     * Required if README.md has relative pathes to links
     */
    baseContentUrl?: string;

    /**
     * (STANDALONE) Base url for content (docs, md files etc.)
     * Required if README.md has relative pathes to images
     */
    baseImagesUrl?: string;

    /**
     * (STANDALONE)
     * By default generated assets from logo.png are not stored
     * in repository
     *  @default false
     */
    storeGeneratedAssetsInRepository?: boolean;

    /**
     * (STANDALONE) By default local release files are stored in repository
     *  @default true
     */
    storeLocalReleaseFilesInRepository?: boolean;

    /**
     * (STANDALONE) Non-isomorphic dependencies for npm lib.
     *
     * At beginning after node_modules installation taon is checking is
     * packages are installed - if not it will throw error.
     * Also.. this dependencies are going to be included in released npm lib
     * as dependencies.
     */
    dependenciesNamesForNpmLib: string[];

    /**
     * (STANDALONE) Same as dependenciesNamesForNpmLib but these dependencies
     * are isomorphic (can be used in browser and node)
     */
    isomorphicDependenciesForNpmLib: string[];

    /**
     * (STANDALONE) At beginning after node_modules installation taon is checking is
     * packages are installed - if not it will throw error.
     * Also.. this peerDependencies are going to be included in released npm lib
     * as peerDependencies.
     */
    peerDependenciesNamesForNpmLib: string[];

    /**
     * (STANDALONE) At beginning after node_modules installation taon is checking is
     * packages are installed - if not it will throw error.
     * Also.. this peerDependencies are going to be included in released npm lib
     * as peerDependencies.
     */
    devDependenciesNamesForNpmLib: string[];

    /**
     * (STANDALONE) At beginning after node_modules installation taon is checking is
     * packages are installed - if not it will throw error.
     * Also.. this optionalDependencies are going to be included in released npm lib
     * as optionalDependencies.
     */
    optionalDependenciesNamesForNpmLib: string[];

    /**
     * (STANDALONE) Provide information about external packages for single file
     * bundling process
     */
    singleFileBundlingPackages: {
      /**
       * Description of external package
       * - why it is external
       * - what is it used for
       * etc.
       */
      description: string;
      /**
       * Name of package that is external
       */
      packageName: string;

      /**
       * Specify for which artifacts this package is external
       * Example:
       * vscode - for vscode plugin (vscode is in runtime of vscode plugin)
       * electron - for electron apps (electron is in runtime of electron app)
       */
      isExternalFor?: TaonArtifactInclude;

      /**
       * replace with nothing require('packageName') - if still is somewhere
       * is final code
       */
      replaceWithNothing?: TaonArtifactInclude;

      /**
       * ! FOR NOW ONLY FOR: 'electron-app' and 'angular-node-app'
       *
       * Native stuff that can't be minified and needs to be included in bundle.
       * Taon will perform npm install for all packages marked with this
       *
       */
      includeInBundleNodeModules?: TaonArtifactInclude;
    }[];

    /**
     * (STANDALONE) so I can release same npm lib
     * with different name
     * @deprecated does not make sense
     */
    additionalNpmNames?: string[];

    /**
     * (STANDALONE)  Project is using own node_modules instead of core container
     */
    isUsingOwnNodeModulesInsteadCoreContainer?: boolean;

    /**
     * (STANDALONE) generate src/lib/index._auto-generated_.ts with
     * all exports from lib ts files
     */
    shouldGenerateAutogenIndexFile: boolean;

    /**
     * (STANDALONE) generate src/app.ts routes, imports and context initializations
     * from ./src/app/*.routes.ts (recursive)
     */
    shouldGenerateAutogenAppRoutesFile: boolean;

    /**
     * (STANDALONE) Auto release helps with releasing multiple projects from a local machine.
     * This is useful when we don't have Taon Cloud set up and want to release
     * all projects with a single command.
     */
    autoReleaseConfigAllowedItems?: TaonAutoReleaseItem[];
  }

  export interface TaonJsonContainer extends TaonJsonCommon {
    /**
     * (CONTAINER) Static resurces for site project, that are
     * going to be included in release dist
     */
    resources?: string[];

    /**
     * (CONTAINER) Force linking node_modules from core container
     */
    linkNodeModulesFromCoreContainer?: boolean;

    /**
     * (CONTAINER) override order of packages during release or buildq
     * so dependencies are released first
     */
    overridePackagesOrder: string[];

    /**
     * (CONTAINER) Don't release inside children -> only tag the version
     */
    createOnlyTagWhenRelease?: boolean;

    /**
     * (CONTAINER) Project is monorepo
     */
    monorepo?: boolean;

    /**
     * (CONTAINER) Project is organization/scope (like @angular)
     */
    organization?: boolean;

    // ! TODO implement this
    /**
     * (CONTAINER) Container projects can be used as micro frontends
     * with router:
     *  <site-path>/  (microFrontendMainProjectName)
     *  <site-path>/_/other-project-name
     */
    microFrontendMainProjectName?: string;
  }

  interface TaonJsonCommon {
    type: LibTypeEnum;
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
     * Folders to remove after pulling from git.
     * Usefull when you have some folders that are
     * not needed in git but there just waiting to be deleted
     * after pulling from git.
     * This may be useful after refactor/moving huge
     * folders around.
     */
    removeAfterPullingFromGit?: string[];
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

  export type TaonJsonCombined = TaonJsonStandalone & TaonJsonContainer;

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
