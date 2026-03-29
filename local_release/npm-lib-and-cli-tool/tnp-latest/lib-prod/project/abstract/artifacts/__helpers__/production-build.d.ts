import { UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__SplitNamespaceResult } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
export declare class ProductionBuild {
    private project;
    protected namespacesForPackagesLib: Map<string, UtilsTypescript__NS__SplitNamespaceResult>;
    protected namespacesForPackagesBrowser: Map<string, UtilsTypescript__NS__SplitNamespaceResult>;
    protected namespacesForPackagesWebsql: Map<string, UtilsTypescript__NS__SplitNamespaceResult>;
    protected reExportsForPackagesLib: Map<string, UtilsTypescript__NS__GatheredExportsMap>;
    protected reExportsForPackagesBrowser: Map<string, UtilsTypescript__NS__GatheredExportsMap>;
    protected reExportsForPackagesWebsql: Map<string, UtilsTypescript__NS__GatheredExportsMap>;
    private readonly nameForNpmPackage;
    constructor(project: Project);
    /**
     *
     * @param generatingAppCode mode for building app code (that contains lib code as well)
     */
    runTask(buildOptions: EnvOptions, generatingAppCode?: boolean): void;
    private setGeneratedReExportsToMapForCurrentPackage;
    private saveGenerateReExportsIndProdDistForCurrentPackage;
    private setGeneratedNamespacesDataForCurrentPackage;
    private combineNamespacesForCurrentPackage;
    private productionCodeReplacement;
}
