import { TaonCloudStatus } from '../taon.models';
import type { TaonProjectsWorker } from '../taon.worker';
import { TraefikServiceProvider } from './treafik-service.provider';
export declare class TraefikProvider {
    private taonProjectsWorker;
    service: TraefikServiceProvider;
    readonly cloudIps: string[];
    protected taonCloudStatus: TaonCloudStatus;
    protected reverseProxyNetworkName: string;
    get cloudIsEnabled(): boolean;
    get isDevMode(): boolean;
    /**
     * Path to traefik docker compose cwd where
     * compose will be started
     */
    get pathToTraefikComposeDestCwd(): string;
    /**
     * Path to traefik docker compose template files
     */
    private get pathToTraefikComposeSourceTemplateFilesCwd();
    constructor(taonProjectsWorker: TaonProjectsWorker);
    protected setEnabledMode(): void;
    protected checkIfDockerEnabled(): Promise<boolean>;
    protected deleteTraefikNetwork(): Promise<void>;
    protected makeSureTraefikNetworkCreated(): Promise<void>;
    protected selectModeExplain(): Promise<void>;
    protected selectMode(options?: {}): Promise<TaonCloudStatus>;
    protected checkIfTraefikIsRunning(options?: {
        waitUntilHealthy?: boolean;
        maxTries?: number;
    }): Promise<boolean>;
    protected selectCloudIps(): Promise<boolean>;
    protected areCloudIpsValid(): Promise<boolean>;
    initialCloudStatusCheck(): Promise<void>;
    restartTraefik(options?: {
        hardRestart?: boolean;
    }): Promise<void>;
    startTraefik(): Promise<boolean>;
    stopTraefik(): Promise<void>;
}
