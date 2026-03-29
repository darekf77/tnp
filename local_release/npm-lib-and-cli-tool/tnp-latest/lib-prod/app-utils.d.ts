import { TemplateFolder } from './constants';
import { EnvOptions, ReleaseArtifactTaon, ReleaseType } from './options';
import type { Project } from './project/abstract/project';
export declare const ALLOWED_TO_RELEASE: {
    [releaseType in ReleaseType]: ReleaseArtifactTaon[];
};
export declare const extractFirstLevelRegions: (content: string) => {
    regionName: string;
    regionContent: string;
}[];
/**
 * @returns relative path to proxy angular project build folder
 */
export declare const angularProjProxyPath: (options: {
    project: Project;
    envOptions: EnvOptions;
    targetArtifact: EnvOptions["release"]["targetArtifact"];
}) => string;
export declare const getProxyNgProj: (project: Project, buildOptions: EnvOptions, targetArtifact: EnvOptions["release"]["targetArtifact"]) => Project;
export declare const templateFolderForArtifact: (artifact: ReleaseArtifactTaon) => TemplateFolder;
export declare const getCleanImport: (importName: string) => string | undefined;
export interface AiMdFile {
    filename: string;
    content: string;
}
export declare function parseAiMdContent(input: string): AiMdFile[];
