import { BaseTestRunner } from './base-test-runner';
export declare class VitestTestRunner extends BaseTestRunner {
    fileCommand(files?: string[]): string;
    private buildCommand;
    start(files: string[], debug: boolean): Promise<void>;
    startAndWatch(files: string[], debug: boolean): Promise<void>;
}
