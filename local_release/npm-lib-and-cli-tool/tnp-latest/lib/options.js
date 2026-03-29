"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allPathsEnvConfig = exports.EnvOptionsDummyWithAllProps = exports.EnvOptions = exports.taonBuildInImages = exports.dockerDatabaseMysql = exports.dockerFrontendNginx = exports.dockerBackendAppNode = exports.ReleaseTypeWithDevelopmentArr = exports.Development = exports.ReleaseTypeArr = exports.ReleaseType = exports.ReleaseArtifactTaonNamesArr = exports.ReleaseArtifactTaon = void 0;
const lib_1 = require("lodash-walk-object/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const constants_1 = require("./constants");
//#region release artifact taon
/**
 * All possible release types for taon
 * for MANUAL/CLOUD release
 */
var ReleaseArtifactTaon;
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
})(ReleaseArtifactTaon || (exports.ReleaseArtifactTaon = ReleaseArtifactTaon = {}));
exports.ReleaseArtifactTaonNamesArr = [
    ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    ReleaseArtifactTaon.ANGULAR_NODE_APP,
    ReleaseArtifactTaon.ELECTRON_APP,
    ReleaseArtifactTaon.MOBILE_APP,
    ReleaseArtifactTaon.VSCODE_PLUGIN,
    ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
];
//#endregion
//#region release type
var ReleaseType;
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
})(ReleaseType || (exports.ReleaseType = ReleaseType = {}));
exports.ReleaseTypeArr = [
    ReleaseType.MANUAL,
    ReleaseType.LOCAL,
    ReleaseType.CLOUD,
    ReleaseType.STATIC_PAGES,
];
exports.Development = 'development';
exports.ReleaseTypeWithDevelopmentArr = [
    ...exports.ReleaseTypeArr,
    exports.Development,
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
exports.dockerBackendAppNode = {
    name: 'backend-app-node',
    skipStartInDevMode: true,
    pathToProjectWithDockerfile: (project) => {
        //#region @backendFunc
        return project.ins
            .by(lib_2.LibTypeEnum.ISOMORPHIC_LIB)
            .pathFor([constants_1.DOCKER_TEMPLATES, 'backend-app-node']);
        //#endregion
    },
};
exports.dockerFrontendNginx = {
    name: 'frontend-app-node',
    skipStartInDevMode: true,
    pathToProjectWithDockerfile: (project) => {
        //#region @backendFunc
        return project.ins
            .by(lib_2.LibTypeEnum.ISOMORPHIC_LIB)
            .pathFor([constants_1.DOCKER_TEMPLATES, 'frontend-app-node']);
        //#endregion
    },
};
exports.dockerDatabaseMysql = {
    name: 'database-mysql',
    pathToProjectWithDockerfile: (project) => {
        //#region @backendFunc
        return project.ins
            .by(lib_2.LibTypeEnum.ISOMORPHIC_LIB)
            .pathFor([constants_1.DOCKER_TEMPLATES, 'database-mysql']);
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
    'backend-app-node': exports.dockerBackendAppNode,
    'frontend-app': exports.dockerFrontendNginx,
    'database-mysql': exports.dockerDatabaseMysql,
};
exports.taonBuildInImages = Object.values(taonBuiltinDockerImages);
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
class EnvOptions {
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
            : await lib_2.UtilsTerminal.multiselect({
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
        lib_3.Helpers.info(`

      Your command:

${lib_2.chalk.bold(options.toStringCommand(args.join(' ')))}

      `);
        await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
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
        lib_1.walk.Object(this, (value, lodashPath) => {
            if (lib_4._.isNil(value) || lib_4._.isFunction(value)) {
                // skipping
            }
            else {
                // _.set(destination, lodashPath, value);
                if (lib_4._.isBoolean(value)) {
                    value = value ? 'true' : 'false';
                }
                if (lib_4._.isArray(value) || lodashPath.includes('[')) {
                    if (lib_4._.isArray(value)) {
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
                    if (lib_4._.isObject(value)) {
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
        return `${lib_2.config.frameworkName} ${taonCommand || ''} ${paramsCommand}`.trim();
    }
    /**
     * override existed/proper fields from "override" object
     * inside "destination" object
     */
    static merge(destination, override) {
        lib_1.walk.Object(override || {}, (value, lodashPath) => {
            if (lib_4._.isNil(value) || lib_4._.isFunction(value) || lib_4._.isObject(value)) {
                // skipping
            }
            else {
                lib_4._.set(destination, lodashPath, value);
            }
        }, {
            walkGetters: false,
        });
        return destination;
    }
    static saveToFile(options, absFilePath) {
        //#region @backendFunc
        lib_3.Helpers.writeJson(absFilePath, options);
        //#endregion
    }
    static loadFromFile(absFilePath) {
        //#region @backendFunc
        const options = lib_3.Helpers.readJson(absFilePath);
        return EnvOptions.from(options);
        //#endregion
    }
    static getParamsString(options) {
        //#region @backendFunc
        const env = EnvOptions.from(options);
        let pathWithParams = '';
        lib_1.walk.Object(env, (value, lodashPath) => {
            if (lib_4._.isNil(value) || lib_4._.isFunction(value) || lib_4._.isObject(value)) {
                // skipping
            }
            else {
                if (Array.isArray(value)) {
                    for (const val of value) {
                        if (lib_4._.isBoolean(value)) {
                            pathWithParams += ` --${lodashPath}=${val ? 'true' : 'false'} `;
                        }
                        else {
                            pathWithParams += ` --${lodashPath}=${val} `;
                        }
                    }
                }
                else {
                    const val = value;
                    if (lib_4._.isBoolean(value)) {
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
        this.config = lib_4._.merge(this.config, lib_4._.cloneDeep(override.config));
        this.container = lib_4._.merge(new EnvOptionsContainer(), this.container);
        if (lib_4._.isString(this.container.only) && this.container.only.includes(',')) {
            this.container.only = this.container.only.split(',');
        }
        this.container.only =
            (lib_4._.isString(this.container.only)
                ? [this.container.only]
                : this.container.only) || [];
        if (!lib_4._.isArray(this.container.only)) {
            this.container.only = [];
        }
        if (lib_4._.isString(this.container.skip) && this.container.skip.includes(',')) {
            this.container.skip = this.container.skip.split(',');
        }
        this.container.skip =
            (lib_4._.isString(this.container.skip)
                ? [this.container.skip]
                : this.container.skip) || [];
        if (!lib_4._.isArray(this.container.skip)) {
            this.container.skip = [];
        }
        this.ports = lib_4._.merge(new EnvOptionsPorts(), this.ports);
        this.init = lib_4._.merge(new EnvOptionsInit(), this.init);
        this.build = this.build || {};
        this.build.pwa = lib_4._.merge(new EnvOptionsBuildPwa(), this.build?.pwa);
        this.build.electron = lib_4._.merge(new EnvOptionsBuildElectron(), this.build?.electron);
        this.build = lib_4._.merge(new EnvOptionsBuild(), this.build);
        if (lib_4._.isString(this['base-href']) &&
            this['base-href'] &&
            this['base-href'] !== '/') {
            // QUICK FIX
            this.build.baseHref = this['base-href'];
            delete this['base-href'];
            delete override['base-href'];
        }
        if (lib_4._.isString(this.build.baseHref)) {
            this.build.baseHref = (0, lib_4.crossPlatformPath)(this.build.baseHref);
            if (!this.build.baseHref.startsWith('/')) {
                this.build.baseHref = `/${this.build.baseHref}`;
            }
            if (!this.build.baseHref.endsWith('/')) {
                this.build.baseHref = `${this.build.baseHref}/`;
            }
        }
        if (lib_4._.isBoolean(this['websql'])) {
            // QUICK FIX
            this.build.websql = this['websql'];
            delete this['websql'];
            delete override['websql'];
        }
        if (lib_4._.isBoolean(this['ssr'])) {
            // QUICK FIX
            this.build.ssr = this['ssr'];
            delete this['ssr'];
            delete override['ssr'];
        }
        this.loading = this.loading || {};
        this.loading.preAngularBootstrap = lib_4._.merge(new EnvOptionsLoadingPreAngularBootstrap(), this.loading?.preAngularBootstrap);
        // this.loading.afterAngularBootstrap = _.merge(
        //   new EnvOptionsLoadingAfterAngularBootstrapConfig(),
        //   this.loading?.afterAngularBootstrap,
        // );
        this.loading = lib_4._.merge(new EnvOptionsLoading(), this.loading);
        this.release = this.release || {};
        this.release.cli = lib_4._.merge(new EnvOptionsBuildCli(), this.release?.cli);
        this.release.nodeBackendApp = lib_4._.merge(new EnvOptionsNodeBackendApp(), this.release?.nodeBackendApp);
        this.release.lib = lib_4._.merge(new EnvOptionsBuildLib(), this.release?.lib);
        this.release = lib_4._.merge(new EnvOptionsRelease(), this.release);
        this.copyToManager = lib_4._.merge(new EnvOptionsCopyToManager(), this.copyToManager);
        this.website = lib_4._.merge(new EnvOptionsWebsite(), this.website);
        // fields fixes, prevent incorrect values
        if (lib_4._.isString(this.website.domain)) {
            this.website.domain = this.website.domain.replace(/\/$/, '');
            this.website.domain = this.website.domain.replace(/^https?:\/\//, '');
        }
        if (lib_4._.isString(this.release.skipBuildingArtifacts)) {
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
        const toClone = lib_4._.cloneDeep(this);
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
exports.EnvOptions = EnvOptions;
//#endregion
//#region dummy for generating environments
/**
 * Purpose of this dummy is to have all properties
 * when generating environments
 */
exports.EnvOptionsDummyWithAllProps = EnvOptions.from({
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
            useLocalReleaseBranch: '_',
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
        pushToAllOriginsWhenLocalReleaseBranch: '-',
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
exports.allPathsEnvConfig = allPathsEnvConfig;
lib_1.walk.Object(exports.EnvOptionsDummyWithAllProps, (value, lodashPath) => {
    if (Array.isArray(value)) {
        allPathsEnvConfig.push(lodashPath);
    }
    else {
        if (!lib_4._.isObject(value) &&
            !lib_4._.isFunction(value) &&
            !lodashPath.includes('[') // it is array
        ) {
            allPathsEnvConfig.push(lodashPath);
        }
    }
}, { walkGetters: false });
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/options.js.map