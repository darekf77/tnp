import { CoreModels__NS__ReleaseVersionType } from 'tnp-core/lib-prod';
import { BasePackageJson, BaseJsonFileReaderOptions } from 'tnp-helpers/lib-prod';
import { PackageJson } from 'type-fest';
import type { Project } from './project';
export declare class PackageJSON extends BasePackageJson {
    private project;
    KEY_TNP_PACKAGE_JSON: string;
    constructor(options: Omit<BaseJsonFileReaderOptions<PackageJson>, 'fileName'>, project: Project);
    private updateDataFromTaonJson;
    private setDataFromCoreContainer;
    recreateBin(): any;
    saveToDisk(purpose?: string): void;
    resolvePossibleNewVersion(releaseVersionBumpType: CoreModels__NS__ReleaseVersionType): string;
}
