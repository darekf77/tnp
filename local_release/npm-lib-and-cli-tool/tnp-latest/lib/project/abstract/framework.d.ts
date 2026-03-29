import { CoreModels } from 'tnp-core';
import { BaseFeatureForProject } from 'tnp-helpers';
import { Models } from '../../models';
import { EnvOptions } from '../../options';
import type { Project } from './project';
export declare class Framework extends BaseFeatureForProject<Project> {
    get isUnknownNpmProject(): boolean;
    /**
     * TODO make this more robust
     */
    get isTnp(): boolean;
    /**
     * Core project with basic tested functionality
     */
    get isCoreProject(): boolean;
    get isContainerWithLinkedProjects(): boolean;
    /**
     * is normal or smart container
     */
    get isContainer(): boolean;
    get isContainerCoreProject(): boolean;
    get isContainerChild(): boolean;
    /**
     * Standalone project ready for publish on npm
     * Types of standalone project:
     * - isomorphic-lib : backend/fronded ts library with server,app preview
     * - angular-lib: frontend ui lib with angular preview
     */
    get isStandaloneProject(): boolean;
    get frameworkVersion(): CoreModels.FrameworkVersion;
    get frameworkVersionMinusOne(): CoreModels.FrameworkVersion;
    frameworkVersionEquals(version: CoreModels.FrameworkVersion): boolean;
    frameworkVersionAtLeast(version: CoreModels.FrameworkVersion): boolean;
    migrateFromNgModulesToStandaloneV21(tsFileContent: string): string;
    replaceModuleAndComponentName(tsFileContent: string): string;
    fixCoreContent: (appTsContent: string) => string;
    recreateVarsScss(initOptions: EnvOptions): void;
    preventNotExistedComponentAndModuleInAppTs(): void;
    recreateFileFromCoreProject: (options: {
        fileRelativePath?: string | string[];
        forceRecrete?: boolean;
        /**
         * if will override **fileRelativePath** with different path
         * to get file from core project
         * By default this helper will copy file from core project to this project:
         * <path-to-core-project><fileRelativePath>
         * <this-project><fileRelativePath>
         */
        relativePathInCoreProject?: string | string[];
        customDestinationLocation?: string | string[];
    }) => void;
    frameworkVersionLessThanOrEqual(version: CoreModels.FrameworkVersion): boolean;
    frameworkVersionLessThan(version: CoreModels.FrameworkVersion): boolean;
    get containerDataFromNodeModulesLink(): {
        isCoreContainer: boolean;
        coreContainerFromNodeModules: Project;
    };
    get coreProject(): Project;
    get isLinkToNodeModulesDifferentThanCoreContainer(): boolean;
    /**
     * Get automatic core container for project
     * WHEN NODE_MODULES BELONG TO TNP -> it uses tnp core container
     */
    get coreContainer(): Project;
    get tmpLocalProjectFullPath(): string;
    private resolveAbsPath;
    generateIndexTs(relativePath?: string): void;
    global(globalPackageName: string, packageOnly?: boolean): Promise<string>;
    /**
     * @returns by default it will always return at least one context
     */
    getAllDetectedContextsNames(): string[];
    /**
     * @returns by default it will always return at least one context
     */
    getAllDetectedTaonContexts(options?: {
        skipLibFolder?: boolean;
    }): Models.TaonContext[];
    contextFilter(relativePath: string): boolean;
    private _allDetectedNestedContexts;
    get allDetectedExternalIsomorphicDependenciesForNpmLibCode(): string[];
    get allDetectedExternalNPmDependenciesForNpmLibCode(): string[];
    recreateAppTsPresentationFiles(): void;
    NODE_BUILTIN_MODULES: string[];
    setFrameworkVersion(newFrameworkVersion: CoreModels.FrameworkVersion, options?: {
        confirm?: boolean;
    }): Promise<void>;
    setNpmVersion(npmVersion: string, options?: {
        confirm?: boolean;
    }): Promise<void>;
    generateLibIndex(): Promise<void>;
    generateAppRoutes(): Promise<void>;
    filterVerfiedBuilds(packagesNames: string[]): string[];
    get notVerifiedIsomorphicPackagesBuildsInNodeModules(): string[];
}