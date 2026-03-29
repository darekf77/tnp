export declare const TaonProjectsContextTemplate: () => {
    readonly contextName: string;
    readonly appId: string;
    cloneAsRemote: (cloneOpt?: {
        overrideRemoteHost?: string;
    }) => any;
    cloneAsNormal: (cloneOpt?: {
        overrideHost?: string;
    }) => any;
    __ref(): Promise<import("taon/lib-prod").EndpointContext>;
    readonly __refSync: import("taon/lib-prod").EndpointContext;
    getClassInstance<T>(ctor: new (...args: any[]) => T): T;
    getClass<T>(ctor: new (...args: any[]) => T): new (...args: any[]) => T;
    initialize: (overrideOptions?: import("taon/lib-prod").Models__NS__TaonInitializeParams) => Promise<import("taon/lib-prod").EndpointContext>;
    readonly realtime: {
        readonly client: import("taon/lib-prod").RealtimeClient;
        readonly server: import("taon/lib-prod").RealtimeServer;
    };
};
