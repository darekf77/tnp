import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import type { Project } from '../abstract/project';
/**
 * QUICK_FIX for spaces after and before each region
 * Formats TypeScript region comments:
 * - Ensures a blank line BEFORE each #region / region
 * - Ensures a blank line AFTER each #endregion / endregion
 *   (but skips the "after" blank line if it's the final region before a closing })
 */
export declare function formatRegions(code: string): string;
export declare class Refactor extends BaseFeatureForProject<Project> {
    private prepareOptions;
    ALL(options?: {
        initingFromParent?: boolean;
        fixSpecificFile?: string | undefined;
    }): Promise<void>;
    prettier(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
    eslint(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
    removeBrowserRegion(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
    changeCssToScss(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
    properStandaloneNg19(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
    importsWrap(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
    flattenImports(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
    taonNames(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
    /**
     * Replaces self imports (imports using the package name) with proper relative paths.
     */
    selfImports(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
    classIntoNs(options: {
        fixSpecificFile?: string;
    }): Promise<void>;
}
