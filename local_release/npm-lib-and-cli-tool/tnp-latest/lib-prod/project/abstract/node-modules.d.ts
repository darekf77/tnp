import { CoreModels__NS__NpmInstallOptions } from 'tnp-core/lib-prod';
import { BaseNodeModules } from 'tnp-helpers/lib-prod';
import type { NpmHelpers } from './npm-helpers';
import type { Project } from './project';
export declare class NodeModules extends BaseNodeModules {
    project: Project;
    npmHelpers: NpmHelpers;
    constructor(project: Project, npmHelpers: NpmHelpers);
    /**
     * TODO use this when async not available
     */
    reinstallSync(): void;
    hasPackageInstalled(packageName: string): boolean;
    /**
     * OVERRIDDEN METHOD for taon use case
     */
    reinstall(options?: Omit<CoreModels__NS__NpmInstallOptions, 'pkg'>): Promise<void>;
    linkFromCoreContainer(): Promise<void>;
    get shouldDedupePackages(): boolean;
    /**
     * BIG TODO Organization project when compiled in dist folder
     * should store backend files in lib folder
     */
    get compiledProjectFilesAndFolders(): string[];
    dedupe(selectedPackages?: string[], fake?: boolean): void;
    dedupeCount(selectedPackages?: string[]): void;
    private get packagesToDedupe();
    /**
     * Remove already compiled package from node_modules
     * in project with the same name
     *
     * let say we have project "my-project" and we want to remove
     * "my-project" from node_modules of "my-project"
     *
     * This helper is helpful when we want to minified whole library
     * into single file (using ncc)
     */
    removeOwnPackage(actionwhenNotInNodeModules: () => {}): Promise<void>;
    getIsomorphicPackagesNames(): string[];
    getIsomorphicPackagesNamesInDevMode(): string[];
    getAllPackagesNames: (options?: {
        followSymlinks?: boolean;
    }) => string[];
    checkIfInDevMode(packageName: string): boolean;
    checkIsomorphic(packageName: string): boolean;
}
