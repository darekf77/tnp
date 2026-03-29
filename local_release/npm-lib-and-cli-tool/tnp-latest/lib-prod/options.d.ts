import type axiosType from 'axios';
import { CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__LibType, CoreModels__NS__ReleaseVersionType } from 'tnp-core/lib-prod';
import { Models__NS__TaonLoaderConfig } from './models';
import type { Project } from './project/abstract/project';
/**
 * All possible release types for taon
 * for MANUAL/CLOUD release
 */
export declare enum ReleaseArtifactTaon {
    /**
     * Npm lib package and global cli tool
     */
    NPM_LIB_PKG_AND_CLI_TOOL = "npm-lib-and-cli-tool",
    /**
     * Angular frontend webapp (pwa) + nodejs backend inside docker
     */
    ANGULAR_NODE_APP = "angular-node-app",
    /**
     * Angular + Electron app
     */
    ELECTRON_APP = "electron-app",
    /**
     * Angular + Capacitor
     */
    MOBILE_APP = "mobile-app",
    /**
     * Visual Studio Code extension/plugin
     */
    VSCODE_PLUGIN = "vscode-plugin",
    /**
     * Documentation (MkDocs + compodoc + storybook)
     * webapp (pwa) inside docker
     */
    DOCS_DOCS_WEBAPP = "docs-webapp"
}
export declare const ReleaseArtifactTaonNamesArr: ReleaseArtifactTaon[];
export declare enum ReleaseType {
    /**
     * Manual release (happen physically on local machine)
     */
    MANUAL = "manual",
    /**
     * Releases artifact to local repository <project-location>/local_release/<artifact-name>/<release build files>
     */
    LOCAL = "local",
    /**
     * Trigger cloud release (happen on cloud server)
     * Cloud release actually start "Manual" release process on cloud server
     */
    CLOUD = "cloud",
    /**
     * Trigger cloud release (happen on cloud server)
     * Cloud release actually start "Manual" release process on cloud server
     */
    STATIC_PAGES = "static-pages"
}
export declare const ReleaseTypeArr: ReleaseType[];
export declare const Development = "development";
export declare const ReleaseTypeWithDevelopmentArr: (ReleaseType | 'development')[];
declare class EnvOptionsBuildPwa {
    disableServiceWorker: boolean;
    name?: string;
    short_name?: string;
    start_url?: string;
}
declare class EnvOptionsBuildElectron {
    showDevTools: boolean;
}
declare class EnvOptionsBuildCli {
    /**
     * using esbuild (default false)
     */
    minify: boolean;
    /**
     *  using esbuild (default false)
     */
    includeNodeModules: boolean;
    /**
     * using uglifyjs
     */
    uglify: boolean;
    /**
     * using only works with uglify = true
     */
    compress: boolean;
    /**
     * using  obscurejs
     */
    obscure: boolean;
}
declare class EnvOptionsNodeBackendApp {
    /**
     * using esbuild
     */
    minify: boolean;
}
declare class EnvOptionsBuildLib {
    removeDts: boolean;
    uglifyFileByFile: boolean;
    obscureFileByFile: boolean;
    includeSourceMaps: boolean;
    compress: boolean;
    /**
     * skip include lib files (only cli.js + bin stays)
     * Perfect for just releasing cli tool
     */
    doNotIncludeLibFiles: boolean;
}
declare class EnvOptionsBuild {
    /**
     * override output path
     * for combined/bundled build artifact
     */
    overrideOutputPath: string;
    /**
     * base-href -> is a part of lib code build
     *
     * overwrite base href for app deployment.
     * Must be at least equal: '/'
     *
     * default: /
     * default for github pages standalone project: '/<project-name-or-overwritten>/'
     * default for organizaion main target: '/<project-name-or-overwritten>/'
     * default for organizaion main other targets: '/<project-name-or-overwritten>/-/<other-target-name>/'
     */
    baseHref: string;
    websql: boolean;
    /**
     * Taon production release mode:
     * - splitting namespaces
     * - all possible optimization
     */
    prod?: boolean;
    /**
     * watch build
     */
    watch: boolean;
    /**
     * true by default
     */
    ssr: boolean;
    /**
     * show electron dev tools
     */
    electron: Partial<EnvOptionsBuildElectron>;
    /**
     * Do not generate backend code
     */
    genOnlyClientCode: boolean;
    pwa: Partial<EnvOptionsBuildPwa>;
}
export declare const dockerBackendAppNode: TaonDockerContainerConfig;
export declare const dockerFrontendNginx: TaonDockerContainerConfig;
export declare const dockerDatabaseMysql: TaonDockerContainerConfig<{
    MYSQL_ROOT_PASSWORD: string;
    MYSQL_DATABASE: string;
    MYSQL_USER: string;
    MYSQL_PASSWORD: string;
    readonly HEALTH_PORT: number;
}>;
declare const taonBuiltinDockerImages: {
    'backend-app-node': TaonDockerContainerConfig<{}>;
    'frontend-app': TaonDockerContainerConfig<{}>;
    'database-mysql': TaonDockerContainerConfig<{
        MYSQL_ROOT_PASSWORD: string;
        MYSQL_DATABASE: string;
        MYSQL_USER: string;
        MYSQL_PASSWORD: string;
        readonly HEALTH_PORT: number;
    }>;
};
export declare const taonBuildInImages: TaonDockerContainerConfig[];
export interface TaonDockerContainerConfig<ENV = {}> {
    /**
     * name for container - should be unique
     */
    name: string;
    /**
     * based on image name or function that return path to dockerfile
     */
    pathToProjectWithDockerfile?: (opt?: {
        project?: Project;
        env?: ENV;
    }) => string;
    /**
     * if true container wont start in dev mode
     * (ng serve, debug js mode on localhost etc.)
     */
    skipStartInDevMode?: boolean;
    /**
     * if wait unit healthy is true
     * then healthCheck function is required
     * and it will be called to check if container is healthy
     */
    healthCheck?: (opt?: {
        axios?: typeof axiosType;
        project?: Project;
        env?: ENV;
    }) => Promise<boolean>;
    waitUnitHealthy?: boolean;
    overrideDotEnv?: {
        [key in keyof ENV]: string | number | boolean;
    };
}
/**
 * Each taon context will get mysql mariadb instead
 * sqljs file database when using docker
 */
declare class EnvOptionsDocker {
    skipStartInOrder?: boolean;
    /**
     * each taon context will use sql.js file database
     */
    skipUsingMysqlDb?: boolean;
    additionalContainer: (Partial<TaonDockerContainerConfig<any>> | keyof typeof taonBuiltinDockerImages)[];
}
declare class EnvOptionsPorts {
}
declare class EnvOptionsLoadingPreAngularBootstrap {
    /**
     * loder path to image or
     * build in loader config
     */
    loader?: string | Models__NS__TaonLoaderConfig;
    /**
     * background body
     */
    background?: string;
}
declare class EnvOptionsLoading {
    /**
     * this is presented before bootstrapping of angular
     * at the beginning of first index.html fetch
     */
    preAngularBootstrap?: Partial<EnvOptionsLoadingPreAngularBootstrap>;
}
declare class EnvOptionsRelease {
    taonInstanceIp?: string;
    /**
     * new version resolve at the beginning of release process
     * and is used for all artifacts
     */
    readonly resolvedNewVersion: string;
    /**
     * skip npm publish
     */
    skipDeploy?: boolean;
    /**
     * skip npm publish
     */
    skipNpmPublish?: boolean;
    /**
     * skip git commit
     */
    skipTagGitPush?: boolean;
    /**
     * skip release question
     */
    skipReleaseQuestion?: boolean;
    /**
     * Useful if you just want to release static pages
     * without any versioning
     */
    skipStaticPagesVersioning?: boolean;
    /**
     * skip git commit
     */
    skipResolvingGitChanges?: boolean;
    /**
     * skip cuting @ n o t F o r N p m tags
     */
    skipCodeCutting?: boolean;
    /**
     * release artifact name
     * for example: "angular-node-app"
     */
    targetArtifact: ReleaseArtifactTaon;
    /**
     * true - skip all artifacts build
     * or array of artifacts to skip
     */
    skipBuildingArtifacts?: ReleaseArtifactTaon[] | boolean;
    /**
     * undefined  - means it is development build
     */
    releaseType?: ReleaseType | undefined;
    /**
     * process that is running in CI (no questions for user)
     */
    releaseVersionBumpType: CoreModels__NS__ReleaseVersionType;
    /**
     * quick automatic release of lib
     */
    autoReleaseUsingConfig: boolean;
    /**
     * ask before deployment to taon cloud
     */
    askUserBeforeFinalAction: boolean;
    /**
     * Task of auto release from config
     */
    autoReleaseTaskName: string;
    /**
     * Tell when to override (html,js,css) static pages files
     * when releasing new version
     * Example:
     * - for docs on "static pages" you just want one docs version for major release
     * - for electron apps on "static pages" you want to have an version for each minor or patch release
     */
    overrideStaticPagesReleaseType: CoreModels__NS__ReleaseVersionType;
    /**
     * Separated repository for static pages releases
     */
    staticPagesCustomRepoUrl?: string;
    envName: CoreModels__NS__EnvironmentNameTaon;
    /**
     * undefined - prod
     * number   -  prod1
     */
    envNumber: number | undefined;
    cli: Partial<EnvOptionsBuildCli>;
    nodeBackendApp: Partial<EnvOptionsNodeBackendApp>;
    lib: Partial<EnvOptionsBuildLib>;
    /**
     * after release install locally
     * - vscode plugin -> to Local VSCode
     * - npm lib -> to Local NPM
     * - angular-node-app -> to Local docker
     * - electron-app -> to current os
     * - mobile-app -> to current connected device
     * - docs-webapp -> as offline pwa app installed in current os
     */
    installLocally: boolean;
    /**
     * after local install remove release output
     * (for quick local test releases)
     */
    removeReleaseOutputAfterLocalInstall?: boolean;
    fixStaticPagesCustomRepoUrl(project?: Project): void;
}
declare class EnvOptionsInit {
    /**
     * init only structure without external deps
     */
    struct: boolean;
    branding: boolean;
}
declare class EnvOptionsCopyToManager {
    skip: boolean;
    beforeCopyHook: () => void | Promise<void>;
    copyToLocations: string[];
    copyToProjects: string[];
}
declare class EnvOptionsWebsite {
    title: string;
    domain: string;
    /**
     * Where taon should allow doamin use in this project.
     *
     * Not using domain ( useDomain = false ) means:
     * -> github pages generated domain
     * -> ip address as domain
     */
    useDomain: boolean;
}
declare class EnvOptionsContainer {
    /**
     * start release on project
     */
    start?: string;
    /**
     * release only specified projects
     */
    only?: string | string[];
    /**
     * skip specified projects
     */
    skip?: string | string[];
    /**
     * end release on project
     */
    end?: string;
    /**
     * skip just released projects (last commit starts with 'release: ')
     * and only release projects with new changes
     */
    skipReleased?: boolean;
}
export declare class EnvOptions<ENV_CONFIG = Record<string, string | number | boolean | null>> {
    static releaseSkipMenu(options: EnvOptions, opt?: {
        selectDefaultValues?: boolean;
        args?: string[];
    }): Promise<EnvOptions>;
    static from(options: Partial<EnvOptions>): EnvOptions;
    toStringCommand(taonCommand?: string): string;
    /**
     * override existed/proper fields from "override" object
     * inside "destination" object
     */
    static merge(destination: any, override: any): EnvOptions;
    static saveToFile(options: Partial<EnvOptions>, absFilePath: string): void;
    static loadFromFile(absFilePath: string): EnvOptions;
    static getParamsString(options: Partial<EnvOptions>): string;
    finishCallback: () => any;
    config?: ENV_CONFIG;
    purpose?: string;
    /**
     * action is recursive
     */
    recursiveAction?: boolean;
    isCiProcess?: boolean;
    container: Partial<EnvOptionsContainer>;
    /**
     * @deprecated everything automatically handled by taon
     */
    ports: Partial<EnvOptionsPorts>;
    docker: Partial<EnvOptionsDocker>;
    release: Partial<EnvOptionsRelease>;
    init: Partial<EnvOptionsInit>;
    build: Partial<EnvOptionsBuild>;
    /**
     * Use this only when you are not using SSR
     */
    loading: Partial<EnvOptionsLoading>;
    copyToManager: Partial<EnvOptionsCopyToManager>;
    website: Partial<EnvOptionsWebsite>;
    readonly name?: CoreModels__NS__EnvironmentNameTaon;
    readonly currentProjectName?: string;
    readonly currentProjectType?: CoreModels__NS__LibType;
    readonly appId?: string;
    readonly buildInfo?: {
        hash?: string;
        date?: Date;
    };
    protected constructor(options?: Partial<EnvOptions>);
    applyFieldsFrom(override?: Partial<EnvOptions>): void;
    saveToFile(absFilePath: string): void;
    loadFromFile(absFilePath: string): void;
    clone(override?: Partial<EnvOptions>, options?: {
        skipPreservingFinishCallback?: boolean;
    }): EnvOptions<ENV_CONFIG>;
}
/**
 * Purpose of this dummy is to have all properties
 * when generating environments
 */
export declare const EnvOptionsDummyWithAllProps: EnvOptions<Record<string, string | number | boolean>>;
declare const allPathsEnvConfig: string[];
export { allPathsEnvConfig };
