import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
import { ProductionBuild } from '../__helpers__/production-build';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
import { InsideStructuresElectron } from '../electron-app/tools/inside-struct-electron';
import { AppHostsRecreateHelper } from './tools/app-hosts-recreate-helper';
import { AngularFeBasenameManager } from './tools/basename-manager';
import { InsideStructuresApp } from './tools/inside-struct-app';
import { MigrationHelper } from './tools/migrations-helper';
export declare class ArtifactAngularNodeApp extends BaseArtifact<{
    appDistOutBrowserAngularAbsPath: string;
    appDistOutBackendNodeAbsPath: string;
    angularNgServeAddress: URL;
}, ReleasePartialOutput> {
    readonly project: Project;
    readonly productionBuild: ProductionBuild;
    readonly migrationHelper: MigrationHelper;
    readonly angularFeBasenameManager: AngularFeBasenameManager;
    readonly insideStructureApp: InsideStructuresApp;
    readonly insideStructureElectron: InsideStructuresElectron;
    readonly appHostsRecreateHelper: AppHostsRecreateHelper;
    private readonly nameForNpmPackage;
    constructor(project: Project);
    clearPartial(options: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        appDistOutBrowserAngularAbsPath: string;
        appDistOutBackendNodeAbsPath: string;
        angularNgServeAddress: URL;
    }>;
    private buildBackend;
    getBrowserENVJSON(releaseOptions: EnvOptions): Promise<any>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
    private deployToTaonCloud;
    /**
     * Absolute path to the output directory for the app
     */
    getOutDirNodeBackendAppAbsPath(buildOptions: EnvOptions): string;
    /**
     * Absolute path to the output directory for the app
     */
    getOutDirAngularBrowserAppAbsPath(buildOptions: EnvOptions): string;
}
