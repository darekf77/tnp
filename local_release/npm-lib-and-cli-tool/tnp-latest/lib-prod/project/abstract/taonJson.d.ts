import { CoreModels__NS__FrameworkVersion, CoreModels__NS__LibType } from 'tnp-core/lib-prod';
import { BaseFeatureForProject, BasePackageJson } from 'tnp-helpers/lib-prod';
import { Models__NS__TaonAutoReleaseItem, Models__NS__TaonJson, Models__NS__TaonJsonContainer } from '../../models';
import { ReleaseArtifactTaon } from '../../options';
import type { Project } from './project';
export declare class TaonJson extends BaseFeatureForProject<Project> {
    private readonly data?;
    /**
     * package.json override
     */
    readonly overridePackageJsonManager: BasePackageJson;
    get path(): string;
    constructor(project: Project, defaultValue?: Partial<Models__NS__TaonJson>);
    /**
     * ! TODO EXPERMIENTAL
     * @deprecated
     */
    reloadFromDisk(): void;
    get exists(): boolean;
    preserveOldTaonProps(): void;
    preservePropsFromPackageJson(): void;
    saveToDisk(purpose?: string): void;
    get type(): CoreModels__NS__LibType;
    /**
     * Resource to include in npm lib
     * (relative paths to files or folders)
     */
    get resources(): string[];
    /**
     * Base url for content (docs, md files etc.)
     * Required if README.md has relative pathes to links
     */
    get baseContentUrl(): string | undefined;
    /**
     * Base url for content (docs, md files etc.)
     * Required if README.md has relative pathes to images
     */
    get baseImagesUrl(): string | undefined;
    get storeGeneratedAssetsInRepository(): boolean;
    get storeLocalReleaseFilesInRepository(): boolean;
    /**
     * Dependencies for npm lib (non isomorphic)
     */
    get dependenciesNamesForNpmLib(): string[];
    get overridePackagesOrder(): string[];
    private setDependenciesNamesForNpmLib;
    /**
     * External isomorphic dependencies for npm lib
     * (build-in/core taon isomorphic packages will not be here)
     */
    get isomorphicDependenciesForNpmLib(): string[];
    private setIsomorphicDependenciesForNpmLib;
    additionalExternalsFor(artifactName: ReleaseArtifactTaon): string[];
    additionalReplaceWithNothingFor(artifactName: ReleaseArtifactTaon): string[];
    getNativeDepsFor(artifactName: ReleaseArtifactTaon): string[];
    /**
     * Peer deps to inlculde in npm lib
     * (relative paths to files or folders)
     */
    get peerDependenciesNamesForNpmLib(): string[];
    /**
     * Peer deps to inlculde in npm lib
     * (relative paths to files or folders)
     */
    get devDependenciesNamesForNpmLib(): string[];
    private setPeerDependenciesNamesForNpmLib;
    /**
     * Peer deps to inlculde in npm lib
     * (relative paths to files or folders)
     */
    get optionalDependenciesNamesForNpmLib(): string[];
    setType(type: CoreModels__NS__LibType): void;
    setFrameworkVersion(frameworkVersionArg: CoreModels__NS__FrameworkVersion): Promise<void>;
    get isUsingOwnNodeModulesInsteadCoreContainer(): boolean;
    get linkNodeModulesFromCoreContainer(): Models__NS__TaonJsonContainer['linkNodeModulesFromCoreContainer'];
    get shouldGenerateAutogenIndexFile(): boolean;
    setShouldGenerateAutogenIndexFile(value: boolean): void;
    setShouldGenerateAutogenAppRoutes(value: boolean): void;
    setCloudFlareAccountSubdomain(value: string): void;
    get cloudFlareAccountSubdomain(): string;
    get shouldGenerateAutogenAppRoutesFile(): boolean;
    get isMonorepo(): boolean;
    get isOrganization(): boolean;
    get nameWhenInsideOrganiation(): string | undefined;
    get overrideNameForCli(): string | undefined;
    get overrideNpmName(): string | undefined;
    get isCoreProject(): boolean;
    get frameworkVersion(): CoreModels__NS__FrameworkVersion | undefined;
    get appId(): string;
    set appId(value: string);
    get removeAfterPullingFromGit(): string[];
    linkTo(destination: string): void;
    get autoReleaseConfigAllowedItems(): Models__NS__TaonAutoReleaseItem[];
    get createOnlyTagWhenRelease(): boolean;
    set autoReleaseConfigAllowedItems(items: Models__NS__TaonAutoReleaseItem[]);
    detectAndUpdateNpmExternalDependencies(): void;
    detectAndUpdateIsomorphicExternalDependencies(): void;
    updateDependenciesFromNpm(options?: {
        onlyPackageNames?: string[];
    }): Promise<void>;
}
