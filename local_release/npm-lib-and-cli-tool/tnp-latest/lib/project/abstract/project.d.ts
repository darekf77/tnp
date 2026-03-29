import { Observable } from 'rxjs';
import { CoreModels } from 'tnp-core';
import { BaseProject, PushProcessOptions } from 'tnp-helpers';
import { EnvOptions } from '../../options';
import type { EnvironmentConfig } from './artifacts/__helpers__/environment-config/environment-config';
import { ArtifactManager } from './artifacts/artifacts-manager';
import type { Framework } from './framework';
import { Git } from './git';
import { IgnoreHide } from './ignore-hide';
import { Linter } from './linter';
import { NodeModules } from './node-modules';
import { NpmHelpers } from './npm-helpers';
import { PackageJSON } from './package-json';
import { PackagesRecognition } from './packages-recognition';
import { TaonProjectResolve } from './project-resolve';
import { QuickFixes } from './quick-fixes';
import { Refactor } from './refactor';
import type { ReleaseProcess } from './release-process';
import { SubProject } from './sub-project';
import { TaonJson } from './taonJson';
import { Vscode } from './vscode-helper';
export declare class Project extends BaseProject<Project, CoreModels.LibType> {
    static ins: TaonProjectResolve;
    readonly type: CoreModels.LibType;
    readonly vsCodeHelpers: Vscode;
    readonly releaseProcess: ReleaseProcess;
    readonly npmHelpers: NpmHelpers;
    readonly subProject: SubProject;
    get packageJson(): PackageJSON;
    get nodeModules(): NodeModules;
    readonly linter: Linter;
    readonly framework: Framework;
    readonly quickFixes: QuickFixes;
    readonly artifactsManager: ArtifactManager;
    readonly git: Git;
    readonly ignoreHide: IgnoreHide;
    readonly taonJson: TaonJson;
    readonly packagesRecognition: PackagesRecognition;
    readonly environmentConfig: EnvironmentConfig;
    readonly refactor: Refactor;
    constructor(location?: string);
    struct(initOptions?: EnvOptions): Promise<void>;
    init(initOptions?: EnvOptions): Promise<void>;
    build(buildOptions?: EnvOptions): Promise<void>;
    release(releaseOptions: EnvOptions): Promise<void>;
    lint(lintOptions?: PushProcessOptions): Promise<void>;
    clear(clearOptions?: Partial<EnvOptions>): Promise<void>;
    isLinuxWatchModeAllowde(): boolean;
    getWatcherFor(folders: string[], watcherType: 'backend' | 'browser' | 'webslq'): Observable<{}>;
    get tmpSourceRebuildForBackendObs(): Observable<{}> | undefined;
    get tmpSourceRebuildForBrowserObs(): Observable<{}> | undefined;
    get tmpSourceRebuildForWebsqlObs(): Observable<{}> | undefined;
    protected hasValidAutoReleaseConfig(envOptions: EnvOptions, options?: {
        project?: Project;
        hideTaskErrors?: boolean;
    }): boolean;
    get branding(): import("./artifacts/__helpers__/branding").Branding;
    /**
     * @deprecated
     */
    get tnpCurrentCoreContainer(): Project;
    /**
     * @overload
     */
    get name(): string;
    get nameForCli(): string;
    /**
     * @overload
     */
    get nameForNpmPackage(): string;
    info(): Promise<string>;
    /**
     * @overload
     */
    get ins(): TaonProjectResolve;
    /**
     * @overload
     */
    get children(): Project[];
    get isMonorepo(): boolean;
}