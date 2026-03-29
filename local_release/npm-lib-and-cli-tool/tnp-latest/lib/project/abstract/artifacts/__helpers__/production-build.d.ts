import { UtilsTypescript } from 'tnp-helpers';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
export declare class ProductionBuild {
    private project;
    protected namespacesForPackagesLib: Map<string, UtilsTypescript.SplitNamespaceResult>;
    protected namespacesForPackagesBrowser: Map<string, UtilsTypescript.SplitNamespaceResult>;
    protected namespacesForPackagesWebsql: Map<string, UtilsTypescript.SplitNamespaceResult>;
    protected reExportsForPackagesLib: Map<string, UtilsTypescript.GatheredExportsMap>;
    protected reExportsForPackagesBrowser: Map<string, UtilsTypescript.GatheredExportsMap>;
    protected reExportsForPackagesWebsql: Map<string, UtilsTypescript.GatheredExportsMap>;
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