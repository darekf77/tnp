import { TaonBaseAbstractEntity } from 'taon/lib-prod';
import { ProcessesState } from './processes.models';
export declare class Processes extends TaonBaseAbstractEntity<Processes> {
    command: string;
    cwd: string;
    state: ProcessesState;
    pid: number;
    ppid: number;
    conditionProcessActiveStdout: string[];
    conditionProcessActiveStderr: string[];
    /**
     * last 40 lines of output
     * (combined stdout + stderr)
     */
    outputLast40lines: string;
    /**
     * absolute path to file where stdout + stderr is logged
     */
    fileLogAbsPath: string;
    get previewString(): string;
    fullPreviewString(options?: {
        boldValues?: boolean;
    }): string;
}
