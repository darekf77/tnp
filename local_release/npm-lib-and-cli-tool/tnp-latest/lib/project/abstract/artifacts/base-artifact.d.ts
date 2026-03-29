import { ReleaseArtifactTaon, EnvOptions, ReleaseType } from './../../../options';
import type { Project } from './../project';
import type { ArtifactsGlobalHelper } from './__helpers__/artifacts-helpers';
import type { ArtifactAngularNodeApp } from './angular-node-app';
import type { ArtifactDocsWebapp } from './docs-webapp';
import type { ArtifactElectronApp } from './electron-app';
import type { ArtifactMobileApp } from './mobile-app';
import type { ArtifactNpmLibAndCliTool } from './npm-lib-and-cli-tool';
import type { ArtifactVscodePlugin } from './vscode-plugin';
export type IArtifactProcessObj = {
    angularNodeApp: ArtifactAngularNodeApp;
    npmLibAndCliTool: ArtifactNpmLibAndCliTool;
    electronApp: ArtifactElectronApp;
    mobileApp: ArtifactMobileApp;
    docsWebapp: ArtifactDocsWebapp;
    vscodePlugin: ArtifactVscodePlugin;
};
export interface ReleasePartialOutput {
    /**
     * Compiled output path for the artifact
     */
    releaseProjPath: string;
    releaseType: ReleaseType;
    /**
     * Absolute path to project folder where the artifact is located
     * and ready to be released with new version
     */
    projectsReposToPushAndTag?: string[];
    projectsReposToPush?: string[];
    resolvedNewVersion?: string;
    deploymentFunction?: () => Promise<void>;
}
export interface PlatformArchType {
    platform?: NodeJS.Platform;
    arch?: 'arm64' | 'x64';
}
export declare abstract class BaseArtifact<BUILD_OUTPUT extends {}, RELEASE_OUTPUT extends ReleasePartialOutput> {
    protected readonly project: Project;
    protected readonly currentArtifactName: ReleaseArtifactTaon;
    constructor(project: Project, currentArtifactName: ReleaseArtifactTaon);
    protected readonly artifacts: IArtifactProcessObj;
    protected readonly globalHelper: ArtifactsGlobalHelper;
    /**
     * + create all temp files and folders for proper inside projects structure
     * + (when struct flag = false) start any longer process that reaches
     *   for external resources like for example: npm install
     */
    abstract initPartial(options: EnvOptions): Promise<EnvOptions>;
    /**
     * everything that in init()
     * + build project
     */
    abstract buildPartial(options: EnvOptions): Promise<BUILD_OUTPUT>;
    /**
     * everything that in build()
     * + release project (publish to npm, deploy to cloud/server etc.)
     */
    abstract releasePartial(options: EnvOptions): Promise<RELEASE_OUTPUT>;
    /**
     * everything that in build()
     * + release project (publish to npm, deploy to cloud/server etc.)
     */
    abstract clearPartial(options: EnvOptions): Promise<void>;
    protected updateResolvedVersion(releaseOptions: EnvOptions): EnvOptions;
    protected shouldSkipBuild(releaseOptions: EnvOptions): boolean;
    protected getStaticPagesClonedProjectLocation(releaseOptions: EnvOptions): Promise<string>;
    protected get __allResources(): string[];
    protected __restoreCuttedReleaseCodeFromSrc(buildOptions: EnvOptions): void;
    protected __cutReleaseCodeFromSrc(buildOptions: EnvOptions): void;
    protected getDistinctArchitecturePrefix(options?: boolean | PlatformArchType, includeDashEnTheEnd?: boolean): string;
    localReleaseDeploy(outputFromBuildAbsPath: string, releaseOptions: EnvOptions, options?: {
        /**
         * Example extensions: ['.zip', '.vsix']
         */
        copyOnlyExtensions?: string[];
        createReadme?: string;
        distinctArchitecturePrefix?: boolean | PlatformArchType;
    }): Promise<Pick<ReleasePartialOutput, 'releaseProjPath' | 'projectsReposToPushAndTag'>>;
    staticPagesDeploy(outputFromBuildAbsPath: string, releaseOptions: EnvOptions, options?: {
        /**
         * Example extensions: ['.zip', '.vsix']
         */
        copyOnlyExtensions?: string[];
        createReadme?: string;
        distinctArchitecturePrefix?: boolean | PlatformArchType;
    }): Promise<Pick<ReleasePartialOutput, 'releaseProjPath' | 'projectsReposToPush'>>;
}
