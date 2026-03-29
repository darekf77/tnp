import { BaseClientCompiler, ChangeOfFile } from 'incremental-compiler';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
import { CodeCut } from '../code-cut/code-cut';
export declare class BrowserCompilation extends BaseClientCompiler {
    project: Project;
    /**
     * tmpSrcDist(Websql)
     */
    protected srcFolder: string;
    buildOptions: EnvOptions;
    protected compilerName: string;
    codecutNORMAL: CodeCut;
    codecutWEBSQL: CodeCut;
    get customCompilerName(): string;
    readonly absPathTmpSrcDistFolderWEBSQL: string;
    readonly absPathTmpSrcDistFolderNORMAL: string;
    constructor(project: Project, 
    /**
     * tmpSrcDist(Websql)
     */
    srcFolder: string, buildOptions: EnvOptions);
    syncAction(absFilesFromSrc: string[]): Promise<void>;
    private sassDestFor;
    asyncAction(event: ChangeOfFile): Promise<void>;
    asyncActionFor(event: ChangeOfFile, websql: boolean): Promise<void>;
}