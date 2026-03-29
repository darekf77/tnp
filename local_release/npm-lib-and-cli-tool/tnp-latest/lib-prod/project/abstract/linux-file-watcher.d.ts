type WatchOptions = {
    cwd: string;
    isomorphicPackages?: string[];
};
export declare class LinuxFileWatcher {
    private options;
    private sub?;
    private change$;
    readonly rebuild$: import("rxjs").Observable<{}>;
    private debounceTimer?;
    constructor(options: WatchOptions);
    start(): Promise<void>;
    stop(): void;
    private triggerDebounced;
}
export {};
