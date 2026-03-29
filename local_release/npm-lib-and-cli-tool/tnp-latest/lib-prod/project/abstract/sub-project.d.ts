import { BaseQuickFixes } from 'tnp-helpers/lib-prod';
import { TempalteSubprojectType } from '../../constants';
import { Project } from './project';
export declare class SubProject extends BaseQuickFixes<Project> {
    private get tempSubProjectFolder();
    private pathToTempalteInCore;
    private pathToTempalteInCurrentProject;
    private workerNameFor;
    private npmInstall;
    deployment(cwdWorker: string): Promise<void>;
    loginCliCloudFlare(cwdWorker: string): Promise<void>;
    private initProcess;
    private addSecrets;
    private setMode;
    getAll(): string[];
    getAllSubProjects(): Project[];
    private coreProjectBy;
    initAll(): Promise<void>;
    protected getAllByTypePaths(tempalteType: TempalteSubprojectType): string[];
    getAllByType(tempalteType: TempalteSubprojectType): Project[];
    extractWorkersDevInfo(text: string): string;
    addAndConfigure(): Promise<void>;
    testWithExampleData(): Promise<void>;
    setModeForWorker(): Promise<void>;
    setWorkerSecrets(): Promise<void>;
    deployWorker(): Promise<void>;
}
export declare function setSecret(cwdWorker: string, name: string, value: string): Promise<boolean>;
