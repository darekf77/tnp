import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { Project } from '../../../../../../project/abstract/project';
export declare abstract class BaseTestRunner extends BaseFeatureForProject<Project> {
    abstract start(files: string[], debug: boolean): Promise<void>;
    abstract startAndWatch(files: string[], debug: boolean): Promise<void>;
    abstract fileCommand(files: string[]): string;
    run(baseFolderForCode: string, command: string): Promise<void>;
    getCommonFilePattern(where: 'src' | 'e2e' | 'src/tests', files?: string[], extensions?: string[]): string;
}
