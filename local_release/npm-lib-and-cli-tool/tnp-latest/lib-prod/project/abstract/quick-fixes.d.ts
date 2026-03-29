import { BaseQuickFixes } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';
export declare class QuickFixes extends BaseQuickFixes<Project> {
    removeHuskyHooks(): void;
    fixPrettierCreatingConfigInNodeModules(): void;
    recreateTempSourceNecessaryFilesForTesting(initOptions: EnvOptions): void;
    makeSureDistFolderExists(): void;
    missingAngularLibFiles(): void;
    removeBadTypesInNodeModules(): void;
    addMissingSrcFolderToEachProject(): void;
    get nodeModulesPkgsReplacements(): string[];
    /**
     * @deprecated
     * FIX for missing npm packages from npmjs.com
     *
     * Extract each file: node_modules-<package Name>.zip
     * to node_modules folder before instalation.
     * This will prevent packages deletion from npm
     */
    unpackNodeModulesPackagesZipReplacements(): void;
}
