import { Processes } from './processes';
import { TaonBaseRepository } from 'taon/lib-prod';
export declare class ProcessesRepository extends TaonBaseRepository<Processes> {
    entityClassResolveFn: () => typeof Processes;
    private processFileLoggers;
    getByProcessID(processId: number | string): Promise<Processes | null>;
    getByUniqueParams({ cwd, command, }: {
        cwd: string;
        command: string;
    }): Promise<Processes | null>;
    triggerStart(processId: string | number, options?: {
        processName?: string;
    }): Promise<void>;
    triggerStop(processId: string | number, options?: {
        deleteAfterKill?: boolean;
    }): Promise<void>;
    private getAndUpdateProcess;
}
