import { BaseCliWorkerTerminalUI, BaseWorkerTerminalActionReturnType } from 'tnp-helpers';
import type { TaonProjectsWorker } from './taon.worker';
export declare class TaonTerminalUI extends BaseCliWorkerTerminalUI<TaonProjectsWorker> {
    protected headerText(): Promise<string>;
    header(): Promise<void>;
    protected getDomainsMenu(): Promise<void>;
    getWorkerTerminalActions(): BaseWorkerTerminalActionReturnType;
}