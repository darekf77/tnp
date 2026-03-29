import { EnvOptions, ReleaseArtifactTaon } from '../../../../../../options';
import type { Project } from '../../../../project';
import { InsideStruct } from '../inside-struct';
export declare abstract class BaseInsideStruct {
    readonly project: Project;
    readonly initOptions: EnvOptions;
    relativePaths(): string[];
    abstract insideStruct(): InsideStruct;
    abstract getCurrentArtifact(): ReleaseArtifactTaon;
    constructor(project: Project, initOptions: EnvOptions);
    replaceImportsForBrowserOrWebsql(fileContent: string, { websql }: {
        websql: boolean;
    }): string;
    replaceImportsForBackend(fileContent: string): string;
}
