import { CoreModels__NS__FrameworkVersion, CoreModels__NS__LibType, CoreModels__NS__NewFactoryType } from 'tnp-core/lib-prod';
import { BaseProjectResolver } from 'tnp-helpers/lib-prod';
import type { Project } from './project';
import { TaonProjectsWorker } from './taon-worker/taon.worker';
export declare class TaonProjectResolve extends BaseProjectResolver<Project> {
    protected classFn: typeof Project;
    cliToolNameFn: () => string;
    taonProjectsWorker: TaonProjectsWorker;
    private hasResolveCoreDepsAndFolder;
    constructor(classFn: typeof Project, cliToolNameFn: () => string);
    typeFrom(location: string): CoreModels__NS__LibType;
    /**
     * TODO use base resolve
     */
    From(locationOfProj: string | string[]): Project;
    nearestTo<T = Project>(absoluteLocation: string, options?: {
        type?: CoreModels__NS__LibType;
        findGitRoot?: boolean;
        onlyOutSideNodeModules?: boolean;
    }): T;
    get Tnp(): Project;
    by(libraryType: CoreModels__NS__NewFactoryType, version?: CoreModels__NS__FrameworkVersion): Project;
    private get projectsInUserFolder();
    /**
     * taon sync command
     */
    sync({ syncFromCommand }?: {
        syncFromCommand?: boolean;
    }): void;
    initialCheck(): void;
    private pathResolved;
    private resolveCoreProjectsPathes;
    /**
     * only for tnp dev mode cli
     */
    get taonProjectsRelative(): string;
    angularMajorVersionForCurrentCli(): number;
    taonTagToCheckoutForCurrentCliVersion(cwd: string): string;
}
