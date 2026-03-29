import { BaseIgnoreHideHelpers } from 'tnp-helpers/lib-prod';
import type { Project } from './project';
export declare class IgnoreHide// @ts-ignore TODO weird inheritance problem
 extends BaseIgnoreHideHelpers<Project> {
    protected storeInRepoConfigFiles(): boolean;
    private applyToChildren;
    getPatternsIgnoredInRepoButVisibleToUser(): string[];
    get hideInProject(): string[];
    protected alwaysIgnoredHiddenPatterns(): string[];
    protected alwaysIgnoredAndHiddenFilesAndFolders(): string[];
    alwaysUseRecursivePattern(): string[];
    protected hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(): string[];
    protected hiddenButNotNecessaryIgnoredInRepoPatterns(): string[];
    protected hiddenButNeverIgnoredInRepo(): string[];
    getVscodeFilesFoldersAndPatternsToHide(): {
        [fileFolderOrPattern: string]: true;
    };
}
