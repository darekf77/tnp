import { ProcessesController } from '../processes';
import { Deployments } from './deployments';
export declare namespace DeploymentsUtils {
    const displayRealtimeProgressMonitor: (deployment: Deployments, processesController: ProcessesController, options?: {
        resolveWhenTextInOutput?: string;
    }) => Promise<void>;
}
