import { walk } from 'lodash-walk-object/lib-prod';
import { chalk, config, LibTypeEnum, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__pressAnyKeyToContinueAsync } from 'tnp-core/lib-prod';
import { Helpers__NS__info, Helpers__NS__readJson, Helpers__NS__writeJson } from 'tnp-core/lib-prod';
import { crossPlatformPath, ___NS__cloneDeep, ___NS__isArray, ___NS__isBoolean, ___NS__isFunction, ___NS__isNil, ___NS__isObject, ___NS__isString, ___NS__merge, ___NS__set } from 'tnp-core/lib-prod';
import { DOCKER_TEMPLATES } from './constants';
//#region release artifact taon
/**
 * All possible release types for taon
 * for MANUAL/CLOUD release
 */
export var ReleaseArtifactTaon;
(function (ReleaseArtifactTaon) {
    /**
     * Npm lib package and global cli tool
     */
    ReleaseArtifactTaon["NPM_LIB_PKG_AND_CLI_TOOL"] = "npm-lib-and-cli-tool";
    /**
     * Angular frontend webapp (pwa) + nodejs backend inside docker
     */
    ReleaseArtifactTaon["ANGULAR_NODE_APP"] = "angular-node-app";
    /**
     * Angular + Electron app
     */
    ReleaseArtifactTaon["ELECTRON_APP"] = "electron-app";
    /**
     * Angular + Capacitor
     */
    ReleaseArtifactTaon["MOBILE_APP"] = "mobile-app";
    /**
     * Visual Studio Code extension/plugin
     */
    ReleaseArtifactTaon["VSCODE_PLUGIN"] = "vscode-plugin";
    /**
     * Documentation (MkDocs + compodoc + storybook)
     * webapp (pwa) inside docker
     */
    ReleaseArtifactTaon["DOCS_DOCS_WEBAPP"] = "docs-webapp";
})(ReleaseArtifactTaon || (ReleaseArtifactTaon = {}));
export const ReleaseArtifactTaonNamesArr = [
    ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    ReleaseArtifactTaon.ANGULAR_NODE_APP,
    ReleaseArtifactTaon.ELECTRON_APP,
    ReleaseArtifactTaon.MOBILE_APP,
    ReleaseArtifactTaon.VSCODE_PLUGIN,
    ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
];
//#endregion
//#region release type
export var ReleaseType;
(function (ReleaseType) {
    /**
     * Manual release (happen physically on local machine)
     */
    ReleaseType["MANUAL"] = "manual";
    /**
     * Releases artifact to local repository <project-location>/local_release/<artifact-name>/<release build files>
     */
    ReleaseType["LOCAL"] = "local";
    /**
     * Trigger cloud release (happen on cloud server)
     * Cloud release actually start "Manual" release process on cloud server
     */
    ReleaseType["CLOUD"] = "cloud";
    /**
     * Trigger cloud release (happen on cloud server)
     * Cloud release actually start "Manual" release process on cloud server
     */
    ReleaseType["STATIC_PAGES"] = "static-pages";
})(ReleaseType || (ReleaseType = {}));
export const ReleaseTypeArr = [
    ReleaseType.MANUAL,
    ReleaseType.LOCAL,
    ReleaseType.CLOUD,
    ReleaseType.STATIC_PAGES,
];
export const Development = 'development';
export const ReleaseTypeWithDevelopmentArr = [
    ...ReleaseTypeArr,
    Development,
];
//#endregion
//#region env options
//#region env options / build
//#region env options / build / pwa
class EnvOptionsBuildPwa {
}
//#endregion
//#region env options / build / electron
class EnvOptionsBuildElectron {
}
//#endregion
//#region env options / build / cli
class EnvOptionsBuildCli {
}
//#endregion
class EnvOptionsNodeBackendApp {
}
//#region env options / build / cli
class EnvOptionsBuildLib {
}
//#endregion
class EnvOptionsBuild {
}
//#endregion
//#region env options / docker
export const dockerBackendAppNode = {
    name: 'backend-app-node',
    skipStartInDevMode: true,
    pathToProjectWithDockerfile: (project) => {
        //#region @backendFunc
        return project.ins
            .by(LibTypeEnum.ISOMORPHIC_LIB)
            .pathFor([DOCKER_TEMPLATES, 'backend-app-node']);
        //#endregion
    },
};
export const dockerFrontendNginx = {
    name: 'frontend-app-node',
    skipStartInDevMode: true,
    pathToProjectWithDockerfile: (project) => {
        //#region @backendFunc
        return project.ins
            .by(LibTypeEnum.ISOMORPHIC_LIB)
            .pathFor([DOCKER_TEMPLATES, 'frontend-app-node']);
        //#endregion
    },
};
export const dockerDatabaseMysql = {
    name: 'database-mysql',
    pathToProjectWithDockerfile: (project) => {
        //#region @backendFunc
        return project.ins
            .by(LibTypeEnum.ISOMORPHIC_LIB)
            .pathFor([DOCKER_TEMPLATES, 'database-mysql']);
        //#endregion
    },
    healthCheck: async ({ axios, env }) => {
        //#region @backendFunc
        const res = await axios.get(`http://localhost:${env.HEALTH_PORT}/health`);
        return res.data === 'OK';
        //#endregion
    },
};
const taonBuiltinDockerImages = {
    'backend-app-node': dockerBackendAppNode,
    'frontend-app': dockerFrontendNginx,
    'database-mysql': dockerDatabaseMysql,
};
export const taonBuildInImages = Object.values(taonBuiltinDockerImages);
/**
 * Each taon context will get mysql mariadb instead
 * sqljs file database when using docker
 */
class EnvOptionsDocker {
}
//#endregion
//#region env options / ports
class EnvOptionsPorts {
}
//#endregion
//#region env options / loading
//#region env options / loading / pre-angular-bootstrap
class EnvOptionsLoadingPreAngularBootstrap {
}
//#endregion
//#region env options / loading / after-angular-bootstrap
class EnvOptionsLoadingAfterAngularBootstrapConfig {
}
//#endregion
class EnvOptionsLoading {
}
//#endregion
//#region env options / release
class EnvOptionsRelease {
    fixStaticPagesCustomRepoUrl(project) {
        if (this?.staticPagesCustomRepoUrl?.startsWith('-')) {
            this.staticPagesCustomRepoUrl = `${project.git.originURL.replace('.git', '')}${this.staticPagesCustomRepoUrl.replace('.git', '')}.git`;
        }
    }
}
//#endregion
//#region env options / init
class EnvOptionsInit {
}
//#endregion
//#region env options / copy to manager
class EnvOptionsCopyToManager {
}
//#endregion
//#region env options / website
class EnvOptionsWebsite {
}
//#endregion
//#region env options / container
class EnvOptionsContainer {
}
//#endregion
export class EnvOptions {
    //#region static / from
    static async releaseSkipMenu(options, opt) {
        const args = opt?.args || [];
        opt = opt || {};
        const defaultSelected = [
            'skipBuildingArtifactsNpmLibAndCliTool',
            'skipReleaseQuestion',
        ];
        const choices = {
            skipDeploy: {
                name: 'Skip deploy',
            },
            skipNpmPublish: {
                name: 'Skip npm publish',
            },
            skipTagGitPush: {
                name: 'Skip git tag & push',
            },
            skipReleaseQuestion: {
                name: 'Skip release questions',
            },
            skipResolvingGitChanges: {
                name: 'Skip resolving git changes',
            },
            askUserBeforeFinalAction: {
                name: 'Ask before deployment',
            },
            skipBuildingArtifactsNpmLibAndCliTool: {
                name: 'Skip building artifact: npm-lib-and-cli-tool',
            },
            skipBuildingArtifactsAngularNodeApp: {
                name: 'Skip building artifact: angular-node-app',
            },
        };
        const optionsToSet = opt.selectDefaultValues
            ? defaultSelected
            : await UtilsTerminal__NS__multiselect({
                question: 'Select options to skip during release:',
                choices,
                defaultSelected,
                autocomplete: true,
            });
        if (optionsToSet.includes('skipDeploy')) {
            options.release.skipDeploy = true;
        }
        if (optionsToSet.includes('skipNpmPublish')) {
            options.release.skipNpmPublish = true;
        }
        if (optionsToSet.includes('skipTagGitPush')) {
            options.release.skipTagGitPush = true;
        }
        if (optionsToSet.includes('skipReleaseQuestion')) {
            options.release.skipReleaseQuestion = true;
        }
        if (optionsToSet.includes('skipResolvingGitChanges')) {
            options.release.skipResolvingGitChanges = true;
        }
        if (optionsToSet.includes('askUserBeforeFinalAction')) {
            options.release.askUserBeforeFinalAction = true;
        }
        options.release.skipBuildingArtifacts =
            options.release.skipBuildingArtifacts || [];
        if (optionsToSet.includes('skipBuildingArtifactsNpmLibAndCliTool')) {
            options.release.skipBuildingArtifacts.push(ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);
        }
        if (optionsToSet.includes('skipBuildingArtifactsAngularNodeApp')) {
            options.release.skipBuildingArtifacts.push(ReleaseArtifactTaon.ANGULAR_NODE_APP);
        }
        Helpers__NS__info(`

      Your command:

${chalk.bold(options.toStringCommand(args.join(' ')))}

      `);
        await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
        return options;
    }
    static from(options) {
        return new EnvOptions().clone(options);
    }
    toStringCommand(taonCommand) {
        let paramsCommand = '';
        const alreadySetParams = [`--skipMenu true`, '--skipMenu'];
        for (const element of alreadySetParams) {
            taonCommand = taonCommand?.replace(element, '');
        }
        walk.Object(this, (value, lodashPath) => {
            if (___NS__isNil(value) || ___NS__isFunction(value)) {
                // skipping
            }
            else {
                // ___NS__set(destination, lodashPath, value);
                if (___NS__isBoolean(value)) {
                    value = value ? 'true' : 'false';
                }
                if (___NS__isArray(value) || lodashPath.includes('[')) {
                    if (___NS__isArray(value)) {
                        for (const val of value) {
                            const newParam = `--${lodashPath.split('[')[0]} ${val}`;
                            if (!alreadySetParams.includes(newParam)) {
                                paramsCommand = `${paramsCommand} ${newParam} `;
                                alreadySetParams.push(newParam);
                            }
                        }
                    }
                    else {
                        const newParam = `--${lodashPath.split('[')[0]} ${value}`;
                        if (!alreadySetParams.includes(newParam)) {
                            paramsCommand = `${paramsCommand} ${newParam} `;
                            alreadySetParams.push(newParam);
                        }
                    }
                }
                else {
                    if (___NS__isObject(value)) {
                        // skip object
                    }
                    else {
                        const newParam = `--${lodashPath} ${value}`;
                        if (!alreadySetParams.includes(newParam)) {
                            paramsCommand = `${paramsCommand} ${newParam} `;
                            alreadySetParams.push(newParam);
                        }
                    }
                }
            }
        }, {
            walkGetters: false,
        });
        return `${config.frameworkName} ${taonCommand || ''} ${paramsCommand}`.trim();
    }
    /**
     * override existed/proper fields from "override" object
     * inside "destination" object
     */
    static merge(destination, override) {
        walk.Object(override || {}, (value, lodashPath) => {
            if (___NS__isNil(value) || ___NS__isFunction(value) || ___NS__isObject(value)) {
                // skipping
            }
            else {
                ___NS__set(destination, lodashPath, value);
            }
        }, {
            walkGetters: false,
        });
        return destination;
    }
    static saveToFile(options, absFilePath) {
        //#region @backendFunc
        Helpers__NS__writeJson(absFilePath, options);
        //#endregion
    }
    static loadFromFile(absFilePath) {
        //#region @backendFunc
        const options = Helpers__NS__readJson(absFilePath);
        return EnvOptions.from(options);
        //#endregion
    }
    static getParamsString(options) {
        //#region @backendFunc
        const env = EnvOptions.from(options);
        let pathWithParams = '';
        walk.Object(env, (value, lodashPath) => {
            if (___NS__isNil(value) || ___NS__isFunction(value) || ___NS__isObject(value)) {
                // skipping
            }
            else {
                if (Array.isArray(value)) {
                    for (const val of value) {
                        if (___NS__isBoolean(value)) {
                            pathWithParams += ` --${lodashPath}=${val ? 'true' : 'false'} `;
                        }
                        else {
                            pathWithParams += ` --${lodashPath}=${val} `;
                        }
                    }
                }
                else {
                    const val = value;
                    if (___NS__isBoolean(value)) {
                        pathWithParams += ` --${lodashPath}=${val ? 'true' : 'false'} `;
                    }
                    else {
                        pathWithParams += ` --${lodashPath}=${val} `;
                    }
                }
            }
        }, { walkGetters: false });
        return pathWithParams ? ` ${pathWithParams.trim()} ` : ' ';
        //#endregion
    }
    //#endregion
    //#endregion
    //#region constructor
    constructor(options = {}) {
        this.applyFieldsFrom(options);
    }
    //#endregion
    //#region apply fields
    applyFieldsFrom(override) {
        override = override || {};
        EnvOptions.merge(this, override);
        this.config = this.config || {};
        this.config = ___NS__merge(this.config, ___NS__cloneDeep(override.config));
        this.container = ___NS__merge(new EnvOptionsContainer(), this.container);
        if (___NS__isString(this.container.only) && this.container.only.includes(',')) {
            this.container.only = this.container.only.split(',');
        }
        this.container.only =
            (___NS__isString(this.container.only)
                ? [this.container.only]
                : this.container.only) || [];
        if (!___NS__isArray(this.container.only)) {
            this.container.only = [];
        }
        if (___NS__isString(this.container.skip) && this.container.skip.includes(',')) {
            this.container.skip = this.container.skip.split(',');
        }
        this.container.skip =
            (___NS__isString(this.container.skip)
                ? [this.container.skip]
                : this.container.skip) || [];
        if (!___NS__isArray(this.container.skip)) {
            this.container.skip = [];
        }
        this.ports = ___NS__merge(new EnvOptionsPorts(), this.ports);
        this.init = ___NS__merge(new EnvOptionsInit(), this.init);
        this.build = this.build || {};
        this.build.pwa = ___NS__merge(new EnvOptionsBuildPwa(), this.build?.pwa);
        this.build.electron = ___NS__merge(new EnvOptionsBuildElectron(), this.build?.electron);
        this.build = ___NS__merge(new EnvOptionsBuild(), this.build);
        if (___NS__isString(this['base-href']) &&
            this['base-href'] &&
            this['base-href'] !== '/') {
            // QUICK FIX
            this.build.baseHref = this['base-href'];
            delete this['base-href'];
            delete override['base-href'];
        }
        if (___NS__isString(this.build.baseHref)) {
            this.build.baseHref = crossPlatformPath(this.build.baseHref);
            if (!this.build.baseHref.startsWith('/')) {
                this.build.baseHref = `/${this.build.baseHref}`;
            }
            if (!this.build.baseHref.endsWith('/')) {
                this.build.baseHref = `${this.build.baseHref}/`;
            }
        }
        if (___NS__isBoolean(this['websql'])) {
            // QUICK FIX
            this.build.websql = this['websql'];
            delete this['websql'];
            delete override['websql'];
        }
        if (___NS__isBoolean(this['ssr'])) {
            // QUICK FIX
            this.build.ssr = this['ssr'];
            delete this['ssr'];
            delete override['ssr'];
        }
        this.loading = this.loading || {};
        this.loading.preAngularBootstrap = ___NS__merge(new EnvOptionsLoadingPreAngularBootstrap(), this.loading?.preAngularBootstrap);
        // this.loading.afterAngularBootstrap = ___NS__merge(
        //   new EnvOptionsLoadingAfterAngularBootstrapConfig(),
        //   this.loading?.afterAngularBootstrap,
        // );
        this.loading = ___NS__merge(new EnvOptionsLoading(), this.loading);
        this.release = this.release || {};
        this.release.cli = ___NS__merge(new EnvOptionsBuildCli(), this.release?.cli);
        this.release.nodeBackendApp = ___NS__merge(new EnvOptionsNodeBackendApp(), this.release?.nodeBackendApp);
        this.release.lib = ___NS__merge(new EnvOptionsBuildLib(), this.release?.lib);
        this.release = ___NS__merge(new EnvOptionsRelease(), this.release);
        this.copyToManager = ___NS__merge(new EnvOptionsCopyToManager(), this.copyToManager);
        this.website = ___NS__merge(new EnvOptionsWebsite(), this.website);
        // fields fixes, prevent incorrect values
        if (___NS__isString(this.website.domain)) {
            this.website.domain = this.website.domain.replace(/\/$/, '');
            this.website.domain = this.website.domain.replace(/^https?:\/\//, '');
        }
        if (___NS__isString(this.release.skipBuildingArtifacts)) {
            if (this.release.skipBuildingArtifacts.includes(',')) {
                this.release.skipBuildingArtifacts = this.release.skipBuildingArtifacts
                    .split(',')
                    .map(v => v.trim());
            }
            else {
                this.release.skipBuildingArtifacts = [
                    this.release.skipBuildingArtifacts,
                ];
            }
        }
        if (this.build.watch && this.build.prod) {
            this.build.prod = false; // QUICK_FIX no prod for development
        }
    }
    //#endregion
    //#region save to file
    saveToFile(absFilePath) {
        //#region @backendFunc
        EnvOptions.saveToFile(this, absFilePath);
        //#endregion
    }
    //#endregion
    //#region load from file
    loadFromFile(absFilePath) {
        //#region @backendFunc
        const data = EnvOptions.loadFromFile(absFilePath);
        this.applyFieldsFrom(data);
        //#endregion
    }
    //#endregion
    //#region clone
    clone(override, options) {
        //#region @backendFunc
        options = options || {};
        override = override || {};
        const orgFinishCallback = override?.finishCallback;
        const beforeCopyHookOverride = override?.copyToManager?.beforeCopyHook;
        const beforeCopyHookThis = this?.copyToManager?.beforeCopyHook;
        const toClone = ___NS__cloneDeep(this);
        EnvOptions.merge(toClone, override);
        const result = new EnvOptions(toClone);
        if (!options.skipPreservingFinishCallback) {
            if (orgFinishCallback) {
                result.finishCallback = orgFinishCallback;
            }
            else {
                result.finishCallback = () => { };
            }
        }
        if (beforeCopyHookOverride || beforeCopyHookThis) {
            if (beforeCopyHookOverride) {
                result.copyToManager.beforeCopyHook = beforeCopyHookOverride;
            }
            else if (beforeCopyHookThis) {
                result.copyToManager.beforeCopyHook = beforeCopyHookThis;
            }
        }
        return result;
        //#endregion
    }
}
//#endregion
//#region dummy for generating environments
/**
 * Purpose of this dummy is to have all properties
 * when generating environments
 */
export const EnvOptionsDummyWithAllProps = EnvOptions.from({
    config: {},
    purpose: '-',
    recursiveAction: '-',
    isCiProcess: '-',
    container: {
        end: '-',
        only: '-',
        start: '-',
        skipReleased: '-',
    },
    ports: {},
    release: {
        resolvedNewVersion: '-',
        targetArtifact: '-',
        releaseVersionBumpType: '-',
        envName: '-',
        envNumber: '-',
        installLocally: '-',
        removeReleaseOutputAfterLocalInstall: '-',
        cli: {
            minify: '-',
            includeNodeModules: '-',
            uglify: '-',
            obscure: '-',
            compress: '-',
        },
        nodeBackendApp: {
            minify: '-',
        },
        releaseType: '-',
        lib: {
            removeDts: '-',
            obscureFileByFile: '-',
            uglifyFileByFile: '-',
            includeSourceMaps: '-',
            compress: '-',
            doNotIncludeLibFiles: '-',
        },
        autoReleaseUsingConfig: '-',
        autoReleaseTaskName: '-',
        taonInstanceIp: '-',
        skipNpmPublish: '-',
        skipDeploy: '-',
        skipTagGitPush: '-',
        skipReleaseQuestion: '-',
        skipResolvingGitChanges: '-',
        skipCodeCutting: '-',
        skipBuildingArtifacts: '-',
    },
    init: {
        branding: '-',
        struct: '-',
    },
    docker: {
        additionalContainer: '-',
        skipStartInOrder: '-',
        skipUsingMysqlDb: '-',
    },
    build: {
        ssr: '-',
        // angularSsr: '-' as any,
        websql: '-',
        prod: '-',
        electron: {
            showDevTools: '-',
        },
        pwa: {
            disableServiceWorker: '-',
            name: '-',
            short_name: '-',
            start_url: '-',
        },
        overrideOutputPath: '-',
        baseHref: '-',
        watch: '-',
        genOnlyClientCode: '-',
    },
    loading: {
        // afterAngularBootstrap: {
        //   loader: '-' as any,
        //   background: '-' as any,
        // },
        preAngularBootstrap: {
            loader: '-',
            background: '-',
        },
    },
    copyToManager: {
        beforeCopyHook: '-',
        copyToLocations: '-',
        copyToProjects: '-',
        skip: '-',
    },
    website: {
        domain: '-',
        title: '-',
        useDomain: '-',
    },
});
const allPathsEnvConfig = [];
walk.Object(EnvOptionsDummyWithAllProps, (value, lodashPath) => {
    if (Array.isArray(value)) {
        allPathsEnvConfig.push(lodashPath);
    }
    else {
        if (!___NS__isObject(value) &&
            !___NS__isFunction(value) &&
            !lodashPath.includes('[') // it is array
        ) {
            allPathsEnvConfig.push(lodashPath);
        }
    }
}, { walkGetters: false });
export { allPathsEnvConfig };
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/options.js.map