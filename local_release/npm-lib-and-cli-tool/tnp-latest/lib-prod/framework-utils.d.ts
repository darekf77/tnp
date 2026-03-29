import { AiMdFile } from './app-utils';
export declare function FrameworkUtils__NS__copyToAiContent(absPathToFolder: string, onlyfiles?: string[]): Promise<string>;
export declare function FrameworkUtils__NS__pasteFromAIMDContentToFiles(absPathToFolder: string, MdAIcontent: string): Promise<AiMdFile[]>;
type CopyTreeOptions = {
    omitPatterns?: string[];
    maxDepth?: number;
    includeFiles?: boolean;
    includeDirs?: boolean;
    followSymlinks?: boolean;
    sort?: 'alpha' | 'dirsFirst' | 'none';
};
export declare function FrameworkUtils__NS__copyTree(cwd: string, omitFolderPatterns?: string[], options?: CopyTreeOptions): Promise<string>;
export {};
