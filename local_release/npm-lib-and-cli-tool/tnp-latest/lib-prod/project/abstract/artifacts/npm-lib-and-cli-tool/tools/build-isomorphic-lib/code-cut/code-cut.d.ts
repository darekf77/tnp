import { ReplaceOptionsExtended } from 'isomorphic-region-loader/lib-prod';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
export declare class CodeCut {
    /**
     * absolute path ex: <project-path>/tmpSrcDist(Websql)
     */
    protected absPathTmpSrcDistFolder: string;
    protected options: ReplaceOptionsExtended;
    /**
     * it may be not available for global, for all compilation
     */
    private project;
    private buildOptions;
    constructor(
    /**
     * absolute path ex: <project-path>/tmpSrcDist(Websql)
     */
    absPathTmpSrcDistFolder: string, options: ReplaceOptionsExtended, 
    /**
     * it may be not available for global, for all compilation
     */
    project: Project, buildOptions: EnvOptions);
    private isAllowedPathForSave;
    /**
     * ex: assets/file.png or my-app/component.ts
     */
    files(relativeFilesToProcess: string[], remove?: boolean): void;
    file(relativePathToFile: string, remove?: boolean): void;
}
