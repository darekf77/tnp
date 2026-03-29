import { BaseFeatureForProject } from 'tnp-helpers';
import type { Project } from './project';
/**
 * TODO refactor this - use immutable db
 */
export declare class PackagesRecognition extends BaseFeatureForProject<Project> {
    private get coreContainer();
    protected inMemoryIsomorphicLibs: any[];
    constructor(project: Project);
    get jsonPath(): string;
    get isomorphicPackagesFromJson(): string[];
    start(reasonToSearchPackages?: string): Promise<void>;
    addIsomorphicPackagesToFile(recognizedPackagesNewPackages: string[]): void;
    resolveAndAddIsomorphicLibsToMemory(isomorphicPackagesNames: string[], informAboutDiff?: boolean): void;
    /**
     * main source of isomorphic isomorphic packages
     */
    get allIsomorphicPackagesFromMemory(): string[];
}