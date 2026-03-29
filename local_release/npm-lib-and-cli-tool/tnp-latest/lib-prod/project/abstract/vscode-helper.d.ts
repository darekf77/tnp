import { BaseVscodeHelpers } from 'tnp-helpers/lib-prod';
import type { Project } from './project';
/**
 * Handle taon things related to vscode
 * support for launch.json, settings.json etc
 */
export declare class Vscode// @ts-ignore TODO weird inheritance problem
 extends BaseVscodeHelpers<Project> {
    init(options?: {
        skipHiddingTempFiles?: boolean;
    }): Promise<void>;
    saveCurrentSettings(): void;
    private saveColorsForWindow;
    recreateJsonSchemaForDocs(): void;
    recreateJsonSchemaForTaon(): void;
    private get vscodePluginDevPreLaunchTask();
    saveTasksJson(): void;
    saveLaunchJson(): Promise<void>;
    get __vscodeLaunchRuntimeArgs(): string[];
    /**
     * for debugging node_modules
     * get out files for debugging
     */
    get outFiles(): any[];
    get sourceMapPathOverrides(): {};
    get __vscodeFileTemplates(): string[];
    getVscodeBottomColor(): string;
    refreshColorsInSettings(): void;
    getBasicSettins(): Promise<object>;
}
