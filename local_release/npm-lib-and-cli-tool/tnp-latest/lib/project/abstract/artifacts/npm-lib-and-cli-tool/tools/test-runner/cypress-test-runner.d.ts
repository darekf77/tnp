import { BaseTestRunner } from './base-test-runner';
export declare class CypressTestRunner extends BaseTestRunner {
    fileCommand(files: string[]): string;
    start(files?: string[], debug?: boolean): Promise<void>;
    startAndWatch(files?: string[], debug?: boolean): Promise<void>;
}
