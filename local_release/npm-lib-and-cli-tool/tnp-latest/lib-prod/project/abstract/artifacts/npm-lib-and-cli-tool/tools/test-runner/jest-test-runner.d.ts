import { BaseTestRunner } from './base-test-runner';
export declare class JestTestRunner extends BaseTestRunner {
    fileCommand(files: string[]): string;
    start(files: string[], debug: boolean): Promise<void>;
    startAndWatch(files: string[], debug: boolean): Promise<void>;
}
