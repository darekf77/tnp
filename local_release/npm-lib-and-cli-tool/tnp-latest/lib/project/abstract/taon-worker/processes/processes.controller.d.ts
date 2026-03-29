import { Taon } from 'taon';
import { TaonBaseCrudController } from 'taon';
import { Processes } from './processes';
export declare class ProcessesController extends TaonBaseCrudController<Processes> {
    entityClassResolveFn: () => typeof Processes;
    private processesRepository;
    getByProcessID(processId: number | string): Taon.Response<Processes>;
    getByUniqueParams(cwd: string, command: string): Taon.Response<Processes>;
    triggerStart(processId: number | string, processName?: string): Taon.Response<void>;
    triggerStop(processId: number | string, deleteAfterKill?: boolean): Taon.Response<void>;
    waitUntilProcessDeleted(processId: string | number): Promise<void>;
    waitUntilProcessStopped(processId: string | number): Promise<void>;
}