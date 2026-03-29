import { Taon__NS__Response } from 'taon/lib-prod';
import { TaonBaseCrudController } from 'taon/lib-prod';
import { Processes } from './processes';
export declare class ProcessesController extends TaonBaseCrudController<Processes> {
    entityClassResolveFn: () => typeof Processes;
    private processesRepository;
    getByProcessID(processId: number | string): Taon__NS__Response<Processes>;
    getByUniqueParams(cwd: string, command: string): Taon__NS__Response<Processes>;
    triggerStart(processId: number | string, processName?: string): Taon__NS__Response<void>;
    triggerStop(processId: number | string, deleteAfterKill?: boolean): Taon__NS__Response<void>;
    waitUntilProcessDeleted(processId: string | number): Promise<void>;
    waitUntilProcessStopped(processId: string | number): Promise<void>;
}
