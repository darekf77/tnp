import { CoreModels, _ } from 'tnp-core/src';
import { PackageJson } from 'type-fest';

import type { Project } from './project/abstract/project';

export namespace Models {
  // taon test type
  export type TestTypeTaon = 'mocha' | 'jest' | 'cypress';
  export const TestTypeTaonArr = ['mocha', 'jest', 'cypress'] as TestTypeTaon[];

  // taon npm package type
  export type SaveAction = 'save' | 'show' | 'hide';

  // taon fe app loader
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

  // env config
  export interface EnvConfigProject {
    baseUrl: string;
    host?: string; // generated
    externalHost?: string;
    name: string; // checked
    type?: CoreModels.LibType; // checked

    port: number; // override type port
    // @backend
    $db?: any;
    isWatchBuild?: boolean; // generated
    isWebsqlBuild?: boolean; // generated
  }

  export interface EnvConfig {
    /**
     * angular production mode
     */
    angularProd?: boolean;
    /**
     * replace title in taon app
     */
    title?: string;
    /**
     * override pwa manifest values
     */
    pwa?: {
      name?: string;
      short_name?: string;
      start_url?: string;
      // theme_color?: string;
      // background_color?: string;
      // display?: string;
      // scope?: string;
    };

    loading?: {
      /**
       * this is persented before boostrapign of angular
       * at the begining of first index.html fetch
       */
      preAngularBootstrap?: {
        /**
         * loder path to image or
         * build in loader config
         */
        loader?: string | TaonLoaderConfig;
        background?: string;
      };
      /**
       * this loader is presented when
       * taon app data is being loader
       * (right after *preAngularBootstrap*)
       */
      afterAngularBootstrap?: {
        /**
         * loder path to image or
         * build in loader config
         */
        loader?: string | TaonLoaderConfig;
        background?: string;
      };
    };

    pathes?: any;
    config?: any;
    configsFromJs?: any;
    /**
     * I will check if code should be available for npm version
     */
    notForNpm?: boolean;
    isCoreProject?: boolean; // generated
    isStandaloneProject?: boolean; // generated
    isSmartContainer?: boolean; // generated
    isSmartContainerTargetProject?: boolean; // generated
    name?: CoreModels.EnvironmentName; // generated
    frameworks?: CoreModels.UIFramework[];
    /**
     * override domain name (use useDomain property to make it work)
     */
    domain?: string;
    /**
     * actually build enviroment for domain from enviroment.js
     */
    useDomain?: boolean;
    dynamicGenIps?: boolean;
    ip?: string | 'localhost';
    workspace: {
      workspace: EnvConfigProject;
      build?: {
        browser: {
          minify: boolean;
          aot: boolean;
          production: boolean;
        };
        server: {
          minify: boolean;
          production: boolean;
        };
      };
      projects: EnvConfigProject[];
    };
    clientProjectName?: string;
    currentLibProjectSourceFolder?: 'src' | 'components';
    currentProjectName?: string;
    currentProjectGenericName?: string;
    currentProjectLaunchConfiguration?: string;
    currentProjectTasksConfiguration?: string;
    currentProjectPort?: number;
    currentProjectLocation?: string;
    currentFrameworkVersion?: string;
    currentProjectIsSite?: boolean;
    currentProjectIsStrictSite?: boolean;
    currentProjectIsDependencySite?: boolean;
    currentProjectIsStatic?: boolean;
    currentProjectComponentsFolder?: string;
    currentProjectTsConfigPathes?: string;
    currentProjectTsConfigPathesForBrowser?: string;
    currentProjectType?: CoreModels.LibType;
    packageJSON?: PackageJson;

    cloud?: {
      ports: {
        update: number;
      };
    };

    build?: {
      number?: number;
      hash?: string;
      date?: Date;
      options?: {
        isWatchBuild?: boolean;
        isWebsqlBuild?: boolean;
        outDir?: 'dist';
      };
    };
  }

  // site option
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

  // taon.json config @deprecated

  // cli root args
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

  // generate project copy
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

  // ps list info
  export interface PsListInfo {
    pid: number;
    ppid: number;
    memory: number;
    cpu: number;
    name: string;
    cmd: string;
  }

  export interface CreateJsonSchemaOptions {
    project: Project;
    nameOfTypeOrInterface: string;
    relativePathToTsFile: string;
  }



  export interface CliLibReleaseOptions {
    cliBuildObscure?: boolean;
    cliBuildUglify?: boolean;
    cliBuildNoDts?: boolean;
    cliBuildIncludeNodeModules?: boolean;
    libBuildUglify?: boolean;
    libBuildObscure?: boolean;
  }


  // taon json
  export interface TaonJson {
    type: CoreModels.LibType;
    /**
     * Static resurces for standalone project, that are
     * going to be included in release dist
     */
    resources?: string[];

    /**
     * deps will be inlcude
     * in npm lib as dependencies
     */
    dependenciesNamesForNpmLib: string[];

    /**
     * so I can release same npm lib
     * with different name
     */
    additionalNpmNames?: string[];
    /**
     * version of taon framework for project
     */
    version?: CoreModels.FrameworkVersion;
    /**
     * Main project for smart container
     * command "taon start" will start this project
     */
    smartContainerBuildTarget?: string;
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
     * Project is smart container
     * for organization npm project
     */
    smart?: boolean;
    /**
     * Project is monorepo
     */
    monorepo?: boolean;
    /**
     * options what to do with cli tool
     */
    cliLibReleaseOptions: CliLibReleaseOptions;
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

  // DocsConfig
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
}
