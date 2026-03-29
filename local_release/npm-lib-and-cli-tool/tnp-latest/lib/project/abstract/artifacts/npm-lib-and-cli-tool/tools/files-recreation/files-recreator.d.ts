import { BaseFeatureForProject } from 'tnp-helpers';
import type { Project } from '../../../../project';
export type RecreateFile = {
    where: string;
    from: string;
};
export declare class FilesRecreator// @ts-ignore TODO weird inheritance problem
 extends BaseFeatureForProject<Project> {
    init(): Promise<void>;
    projectSpecificFilesForStandalone(): string[];
    projectSpecificFilesForContainer(): string[];
    /**
     * Return list of files that are copied from
     * core project each time struct method is called
     * @returns list of relative paths
     */
    projectSpecyficFiles(): string[];
    handleProjectSpecyficFiles(): void;
    filesTemplatesForStandalone(): string[];
    /**
     * Generated automaticly file templates exmpale:
     * file.ts.filetemplate -> will generate file.ts
     * inside triple bracked: {{{  ENV. }}}
     * property ENV can be used to check files
     */
    filesTemplates(): string[];
}