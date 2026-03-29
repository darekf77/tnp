export declare const InstancesContext: () => {
    readonly contextName: string;
    readonly appId: string;
    cloneAsRemote: (cloneOpt?: {
        overrideRemoteHost?: string;
    }) => /*elided*/ any;
    cloneAsNormal: (cloneOpt?: {
        overrideHost?: string;
    }) => /*elided*/ any;
    __ref(): Promise<import("taon/source").EndpointContext>;
    readonly __refSync: import("taon/source").EndpointContext;
    getClassInstance<T>(ctor: new (...args: any[]) => T): T;
    getClass<T>(ctor: new (...args: any[]) => T): new (...args: any[]) => T;
    initialize: (overrideOptions?: import("taon/source").Models.TaonInitializeParams) => Promise<import("taon/source").EndpointContext>;
    readonly realtime: {
        readonly client: import("taon/source").RealtimeClient;
        readonly server: import("taon/source").RealtimeServer;
    };
};