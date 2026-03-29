import { AiMdFile } from './app-utils';
export declare namespace FrameworkUtils {
    export function copyToAiContent(absPathToFolder: string, onlyfiles?: string[]): Promise<string>;
    export function pasteFromAIMDContentToFiles(absPathToFolder: string, MdAIcontent: string): Promise<AiMdFile[]>;
    type CopyTreeOptions = {
        omitPatterns?: string[];
        maxDepth?: number;
        includeFiles?: boolean;
        includeDirs?: boolean;
        followSymlinks?: boolean;
        sort?: 'alpha' | 'dirsFirst' | 'none';
    };
    export function copyTree(cwd: string, omitFolderPatterns?: string[], options?: CopyTreeOptions): Promise<string>;
    export {};
}
