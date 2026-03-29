import { CoreModels } from 'tnp-core';
import { BasePackageJson, BaseJsonFileReaderOptions } from 'tnp-helpers';
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
    resolvePossibleNewVersion(releaseVersionBumpType: CoreModels.ReleaseVersionType): string;
}