import { BaseCli } from './base-cli';
/**
 * TODO refactor move to tnp-helpers
 */ export declare class $Link extends BaseCli {
    _(): Promise<void>;
    /**
     * @returns Absolute paths for detected clis
     */
    _getDetectedLocalCLi(): string[];
    local(absPathToFolderWithCli: string): Promise<void>;
    recreateCliBasicStructure(globalBinFolderPath?: string): void;
    global(): Promise<void>;
    _writeWin32LinkFiles(options: {
        destinationGlobalLink: string;
        attachDebugParam: '--inspect' | '--inspect-brk' | '';
        globalName: string;
        globalBinFolderPath: string;
    }): void;
}
declare const _default: {
    $Link: Function;
};
export default _default;