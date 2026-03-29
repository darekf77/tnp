//#region imports
import { apiPrefix } from 'taon/lib-prod';
import { chalk, crossPlatformPath, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__getFilesFrom, Helpers__NS__info, Helpers__NS__mkdirp, Helpers__NS__removeFileIfExists, Helpers__NS__writeFile, UtilsYaml__NS__jsonToYaml } from 'tnp-core/lib-prod';
import { path, ___NS__first, ___NS__snakeCase } from 'tnp-core/lib-prod';
//#endregion
export class TraefikServiceProvider {
    traefikProvider;
    constructor(traefikProvider) {
        this.traefikProvider = traefikProvider;
    }
    get dynamicServicesRelativePathPart() {
        return crossPlatformPath(['dynamic', 'services']);
    }
    //#region protected methods
    //#region protected methods / get service prefix
    getRuleFromIp(options) {
        //#region @backendFunc
        options = options || {};
        if (options.worker) {
            return `Host(\`${options.publicOrLocalIp}\`) && PathPrefix(\`/${apiPrefix}/${options.worker.workerContextTemplate().contextName}/\`)`;
        }
        return `"Host(\`${options.publicOrLocalIp}\`)"`;
        // can be also rule: "Host(`33.44.55.66`) || HostRegexp(`{subdomain:.+}.33.44.55.66.sslip.io`)"
        //#endregion
    }
    //#endregion
    //#region protected methods / yaml path for service name
    yamlPathForServiceName(options) {
        //#region @backendFunc
        options = options || {};
        const yamlPath = path.join(this.traefikProvider.pathToTraefikComposeDestCwd, this.dynamicServicesRelativePathPart, `${options.ipAsServiceName}.yml`);
        return yamlPath;
        //#endregion
    }
    //#endregion
    //#region protected methods / get ip from yml
    getIpFromYml() {
        //#region @backendFunc
        const ymlFileAbsPath = ___NS__first(Helpers__NS__getFilesFrom([
            this.traefikProvider.pathToTraefikComposeDestCwd,
            this.dynamicServicesRelativePathPart,
        ]).filter(f => f.endsWith('.yml')));
        if (!ymlFileAbsPath || !Helpers__NS__exists(ymlFileAbsPath)) {
            return undefined;
        }
        const ip = path
            .basename(ymlFileAbsPath)
            .replace('.yml', '')
            .replace(/\_/g, '.');
        return ip;
        //#endregion
    }
    //#endregion
    //#endregion
    //#region public methods
    //#region public methods / init service readme
    initServiceReadme() {
        //#region @backendFunc
        Helpers__NS__writeFile([
            this.traefikProvider.pathToTraefikComposeDestCwd,
            this.dynamicServicesRelativePathPart,
            'README.md',
        ], `# Dynamic services folder for Traefik.`);
        //#endregion
    }
    //#endregion
    //#region public methods / register workers
    async registerWorkers(publicOrLocalIp, workers, options) {
        //#region @backendFunc
        options = options || {};
        const routers = {};
        const services = {};
        for (const worker of workers) {
            const safeName = `ip-${publicOrLocalIp.replace(/\./g, '-')}-${worker.contextName.toLowerCase()}`;
            // HTTP router
            routers[`${safeName}-http`] = {
                rule: this.getRuleFromIp({ publicOrLocalIp, worker }),
                service: safeName,
                entryPoints: ['web'],
            };
            // HTTPS router
            routers[`${safeName}-https`] = {
                rule: this.getRuleFromIp({ publicOrLocalIp, worker }),
                service: safeName,
                entryPoints: ['websecure'],
                tls: {},
            };
            // Service
            services[safeName] = {
                loadBalancer: {
                    servers: [
                        {
                            url: `http://host.docker.internal:${worker.port}`,
                        },
                    ],
                },
            };
        }
        const jsonConfig = {
            http: {
                routers,
                services,
            },
        };
        const yamlContent = UtilsYaml__NS__jsonToYaml(jsonConfig);
        const ipAsServiceName = ___NS__snakeCase(publicOrLocalIp);
        const yamlPath = this.yamlPathForServiceName({ ipAsServiceName });
        Helpers__NS__writeFile(yamlPath, yamlContent.trim() + '\n');
        console.log(`✅ Registered service for all workers.`);
        if (options.restartTraefikAfterRegister) {
            await this.traefikProvider.restartTraefik();
        }
        //#endregion
    }
    //#endregion
    //#region public methods / register service
    /**
     * @deprecated
     */
    async register(publicOrLocalIp, localhostPort, options) {
        //#region @backendFunc
        options = options || {};
        const ipAsServiceName = ___NS__snakeCase(publicOrLocalIp);
        const yamlPath = this.yamlPathForServiceName({ ipAsServiceName });
        Helpers__NS__mkdirp(path.dirname(yamlPath));
        Helpers__NS__info(`Registering service ${chalk.bold(ipAsServiceName)} ...`);
        try {
            const yamlContent = `
http:
  routers:
    ip-${ipAsServiceName}-http:
      rule: ${this.getRuleFromIp({ publicOrLocalIp })}
      service: ip-${ipAsServiceName}
      entryPoints:
        - web

    ip-${ipAsServiceName}-https:
      rule: ${this.getRuleFromIp({ publicOrLocalIp })}
      service: ip-${ipAsServiceName}
      entryPoints:
        - websecure
      tls: {}
  services:
    ip-${ipAsServiceName}:
      loadBalancer:
        servers:
          - url: "http://host.docker.internal:${localhostPort}"
`;
            Helpers__NS__writeFile(yamlPath, yamlContent.trim() + '\n');
            console.log(`✅ Registered service: ${ipAsServiceName} → port ${localhostPort}`);
            if (options.restartTraefikAfterRegister) {
                await this.traefikProvider.restartTraefik();
            }
            // Trigger Traefik dynamic reload (it should detect automatically)
            return true;
        }
        catch (err) {
            Helpers__NS__error(err, true, true);
            return false;
        }
        //#endregion
    }
    //#endregion
    //#region public methods / unregister service
    /**
     * Remove traefik routes for service
     * @param serviceId service name to unregister (kebab-case)
     */
    async unregister(publicOrLocalIp) {
        //#region @backendFunc
        const ipAsServiceName = ___NS__snakeCase(publicOrLocalIp);
        try {
            const yamlPath = this.yamlPathForServiceName({ ipAsServiceName });
            if (Helpers__NS__exists(yamlPath)) {
                Helpers__NS__removeFileIfExists(yamlPath);
                console.log(`🗑️  Unregistered service: ${ipAsServiceName}`);
            }
            else {
                console.log(`ℹ️ Service not found: ${ipAsServiceName}`);
            }
            await this.traefikProvider.restartTraefik();
        }
        catch (err) {
            Helpers__NS__error(err, true, true);
        }
        //#endregion
    }
    //#endregion
    //#region public methods / check if service is registered
    /**
     * Check if a service is already registered in Traefik
     * (by verifying if dynamic YAML config exists)
     */
    async isRegistered(publicOrLocalIp) {
        //#region @backendFunc
        try {
            const ipAsServiceName = ___NS__snakeCase(publicOrLocalIp);
            const yamlPath = this.yamlPathForServiceName({
                ipAsServiceName,
            });
            const exists = Helpers__NS__exists(yamlPath);
            return exists;
        }
        catch (err) {
            Helpers__NS__error(err, true, true);
            return false;
        }
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/traefik/treafik-service.provider.js.map