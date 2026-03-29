import { BaseNpmHelpers } from 'tnp-helpers/lib-prod';
import { NodeModules } from './node-modules';
import { PackageJSON } from './package-json';
import type { Project } from './project';
export declare class NpmHelpers extends BaseNpmHelpers<Project> {
    _nodeModulesType: any;
    _packageJsonType: any;
    readonly packageJson: PackageJSON;
    readonly nodeModules: NodeModules;
    constructor(project: Project);
    /**
     * @deprecated
     */
    get lastNpmVersion(): string | undefined;
    checkProjectReadyForNpmRelease(): void;
    /**
     * check whether node_modules installed
     * or linked from core container
     * @returns boolean - true if linked from core container
     */
    get useLinkAsNodeModules(): boolean;
}
