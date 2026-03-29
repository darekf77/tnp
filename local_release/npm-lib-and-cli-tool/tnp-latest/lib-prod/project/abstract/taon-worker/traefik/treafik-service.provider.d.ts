import { BaseCliWorker } from 'tnp-helpers/lib-prod';
import { TraefikProvider } from './traefik.provider';
export declare class TraefikServiceProvider {
    private traefikProvider;
    constructor(traefikProvider: TraefikProvider);
    protected get dynamicServicesRelativePathPart(): string;
    protected getRuleFromIp(options: {
        publicOrLocalIp: string;
        worker?: BaseCliWorker<any, any>;
    }): string;
    protected yamlPathForServiceName(options: {
        ipAsServiceName: string;
    }): string;
    getIpFromYml(): string | undefined;
    initServiceReadme(): void;
    registerWorkers(publicOrLocalIp: string, workers: BaseCliWorker<any, any>[], options?: {
        /**
         * If true, Traefik will be restarted after registering the service
         */
        restartTraefikAfterRegister?: boolean;
    }): Promise<void>;
    /**
     * @deprecated
     */
    register(publicOrLocalIp: string, localhostPort: number, options?: {
        /**
         * If true, Traefik will be restarted after registering the service
         */
        restartTraefikAfterRegister?: boolean;
    }): Promise<boolean>;
    /**
     * Remove traefik routes for service
     * @param serviceId service name to unregister (kebab-case)
     */
    unregister(publicOrLocalIp: string): Promise<void>;
    /**
     * Check if a service is already registered in Traefik
     * (by verifying if dynamic YAML config exists)
     */
    isRegistered(publicOrLocalIp: string): Promise<boolean>;
}
