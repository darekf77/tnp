import { ProcessesController } from './processes.controller';
export declare namespace ProcessesUtils {
    const displayRealtimeProgressMonitor: (processId: number | string, processesController: ProcessesController, options?: {
        resolveWhenTextInOutput?: string;
    }) => Promise<void>;
}
