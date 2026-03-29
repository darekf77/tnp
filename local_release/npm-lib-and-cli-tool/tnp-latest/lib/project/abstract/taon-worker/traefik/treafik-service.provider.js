"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraefikServiceProvider = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
//#endregion
class TraefikServiceProvider {
    traefikProvider;
    constructor(traefikProvider) {
        this.traefikProvider = traefikProvider;
    }
    get dynamicServicesRelativePathPart() {
        return (0, lib_2.crossPlatformPath)(['dynamic', 'services']);
    }
    //#region protected methods
    //#region protected methods / get service prefix
    getRuleFromIp(options) {
        //#region @backendFunc
        options = options || {};
        if (options.worker) {
            return `Host(\`${options.publicOrLocalIp}\`) && PathPrefix(\`/${lib_1.apiPrefix}/${options.worker.workerContextTemplate().contextName}/\`)`;
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
        const yamlPath = lib_3.path.join(this.traefikProvider.pathToTraefikComposeDestCwd, this.dynamicServicesRelativePathPart, `${options.ipAsServiceName}.yml`);
        return yamlPath;
        //#endregion
    }
    //#endregion
    //#region protected methods / get ip from yml
    getIpFromYml() {
        //#region @backendFunc
        const ymlFileAbsPath = lib_3._.first(lib_2.Helpers.getFilesFrom([
            this.traefikProvider.pathToTraefikComposeDestCwd,
            this.dynamicServicesRelativePathPart,
        ]).filter(f => f.endsWith('.yml')));
        if (!ymlFileAbsPath || !lib_2.Helpers.exists(ymlFileAbsPath)) {
            return undefined;
        }
        const ip = lib_3.path
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
        lib_2.Helpers.writeFile([
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
        const yamlContent = lib_2.UtilsYaml.jsonToYaml(jsonConfig);
        const ipAsServiceName = lib_3._.snakeCase(publicOrLocalIp);
        const yamlPath = this.yamlPathForServiceName({ ipAsServiceName });
        lib_2.Helpers.writeFile(yamlPath, yamlContent.trim() + '\n');
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
        const ipAsServiceName = lib_3._.snakeCase(publicOrLocalIp);
        const yamlPath = this.yamlPathForServiceName({ ipAsServiceName });
        lib_2.Helpers.mkdirp(lib_3.path.dirname(yamlPath));
        lib_2.Helpers.info(`Registering service ${lib_2.chalk.bold(ipAsServiceName)} ...`);
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
            lib_2.Helpers.writeFile(yamlPath, yamlContent.trim() + '\n');
            console.log(`✅ Registered service: ${ipAsServiceName} → port ${localhostPort}`);
            if (options.restartTraefikAfterRegister) {
                await this.traefikProvider.restartTraefik();
            }
            // Trigger Traefik dynamic reload (it should detect automatically)
            return true;
        }
        catch (err) {
            lib_2.Helpers.error(err, true, true);
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
        const ipAsServiceName = lib_3._.snakeCase(publicOrLocalIp);
        try {
            const yamlPath = this.yamlPathForServiceName({ ipAsServiceName });
            if (lib_2.Helpers.exists(yamlPath)) {
                lib_2.Helpers.removeFileIfExists(yamlPath);
                console.log(`🗑️  Unregistered service: ${ipAsServiceName}`);
            }
            else {
                console.log(`ℹ️ Service not found: ${ipAsServiceName}`);
            }
            await this.traefikProvider.restartTraefik();
        }
        catch (err) {
            lib_2.Helpers.error(err, true, true);
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
            const ipAsServiceName = lib_3._.snakeCase(publicOrLocalIp);
            const yamlPath = this.yamlPathForServiceName({
                ipAsServiceName,
            });
            const exists = lib_2.Helpers.exists(yamlPath);
            return exists;
        }
        catch (err) {
            lib_2.Helpers.error(err, true, true);
            return false;
        }
        //#endregion
    }
}
exports.TraefikServiceProvider = TraefikServiceProvider;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/traefik/treafik-service.provider.js.map