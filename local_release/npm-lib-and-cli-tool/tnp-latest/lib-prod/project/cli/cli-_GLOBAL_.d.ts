import { BaseGlobalCommandLine } from 'tnp-helpers/lib-prod';
import { Models__NS__CreateJsonSchemaOptions } from '../../models';
import { Project } from '../abstract/project';
import type { TaonProjectResolve } from '../abstract/project-resolve';
export declare class $Global extends BaseGlobalCommandLine<{
    watch?: boolean;
    w?: boolean;
}, Project, TaonProjectResolve> {
    _(): Promise<void>;
    hasSudoCommand(): Promise<void>;
    anymatch(): void;
    addEtcHostsEntry(): void;
    simulateDomain(): Promise<void>;
    detectPackages(): Promise<void>;
    killonport(): Promise<void>;
    killAllNode(): void;
    killAllJava(): Promise<void>;
    fork(): Promise<void>;
    watchersfix(): void;
    watchers(): void;
    code(): Promise<void>;
    PROPERWATCHERTEST(engine: string): Promise<void>;
    /**
     * @deprecated
     */
    ADD_IMPORT_SRC(): void;
    $MOVE_JS_TO_TS(args: any): void;
    ASYNC_PROC: (args: any) => Promise<void>;
    SYNC_PROC: (args: any) => Promise<void>;
    SHOW_RANDOM_HAMSTERS(): Promise<void>;
    showRandomHamstersTypes(): Promise<void>;
    SHOW_LOOP_MESSAGES(args: any): void;
    newTermMessages(): Promise<void>;
    _SHOW_LOOP(c?: any, maximum?: number, errExit?: boolean): void;
    _SHOW_LOOP_MESSAGES(c?: any, maximum?: number, errExit?: boolean, throwErr?: boolean): void;
    dedupecore(): void;
    dedupecorefake(): void;
    DEDUPE(): void;
    DEDUPE_FAKE(): void;
    DEDUPE_COUNT(): void;
    /**
     * generate deps json
     */
    DEPS_JSON(): void;
    reinstall(): Promise<void>;
    reinstallCoreContainers(): Promise<void>;
    FILEINFO: (args: any) => void;
    VERSIONS(): void;
    path(): void;
    ENV_CHECK(args: any): void;
    ENV_INSTALL(): void;
    THROW_ERR(): void;
    BREW(args: any): void;
    run(): void;
    PSINFO(args: string): Promise<void>;
    get absPathToLocalTaonContainers(): string | undefined;
    TNP_SYNC(): Promise<void>;
    SYNC(): Promise<void>;
    CLEAN(): Promise<void>;
    CLEAR(): void;
    CL(): void;
    inprogress(): void;
    depsupdate(): Promise<void>;
    updatedeps(): Promise<void>;
    compareContainers(): void;
    startCliServiceTaonProjectsWorker(): Promise<void>;
    recreateDocsConfigJsonSchema(): Promise<void>;
    recreateTaonJsonSchema(): Promise<void>;
    jsonSchema(): void;
    _createJsonSchemaFrom(options: Models__NS__CreateJsonSchemaOptions): Promise<{}>;
    schemaJson(): void;
    ts(): Promise<void>;
    coreContainerDepsUpdate(): Promise<void>;
    ng(): void;
    isLinkNodeModules(): void;
    linkNodeModulesFromCoreContainer(): void;
    /**
     * Display all imports from specific project file
     */
    imports(): void;
    /**
     * Display all imports from specific project
     */
    allImports(): void;
    dirnameForTnp(): void;
    contexts(): void;
    _regenerateVscodeSettingsColors(): void;
    messagesTest(): void;
    extractStringMetadata(): void;
    aaa(): Promise<void>;
    localSync(): Promise<void>;
    tagsFor(): void;
    testGlob(): void;
    killOthers(): Promise<void>;
    copyimage(): void;
    setDefaultAutoConfigTaskName(): void;
    setTsNoCheckForAppTs(): void;
    getFilesFrom(): void;
    getFoldersFrom(): void;
    aaaaa(): Promise<void>;
    notyficationTest(): Promise<void>;
    spinner(): Promise<void>;
    notVerifiedBuilds(): void;
    countWatchersLinux(): Promise<void>;
}
declare const _default: {
    $Global: Function;
};
export default _default;
