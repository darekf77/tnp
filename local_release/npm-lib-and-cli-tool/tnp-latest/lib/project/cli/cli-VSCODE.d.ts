import type { Project } from '../abstract/project';
import { BaseCli } from './base-cli';
export declare class $Vscode extends BaseCli {
    _(): Promise<void>;
    _displayMenu(): Promise<void>;
    GLOBAL(): void;
    TEMP_SHOW(): void;
    TEMP_HIDE(): void;
    _init(): void;
    INIT(): void;
    _showfilesfor(project: Project): void;
    _hidefilesfor(project: Project): void;
}
declare const _default: {
    $Vscode: Function;
};
export default _default;
