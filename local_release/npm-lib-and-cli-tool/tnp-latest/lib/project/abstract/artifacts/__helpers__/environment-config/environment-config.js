"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentConfig = void 0;
//#region imports
const lib_1 = require("incremental-compiler/lib");
const lib_2 = require("lodash-walk-object/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-core/lib");
const lib_6 = require("tnp-core/lib");
const lib_7 = require("tnp-helpers/lib");
const lib_8 = require("tnp-helpers/lib");
const ts_node_1 = require("ts-node");
const constants_1 = require("../../../../../constants");
const options_1 = require("../../../../../options");
//#endregion
//#region @backend
try {
    (0, ts_node_1.register)({
        transpileOnly: true,
        compilerOptions: {
            skipLibCheck: true,
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
        },
    });
}
catch (error) { }
//#endregion
class EnvironmentConfig // @ts-ignore TODO weird inheritance problem
// @ts-ignore TODO weird inheritance problem
 extends lib_7.BaseFeatureForProject {
    //#region api
    //#region api / create artifact
    async createForArtifact(artifactName, envName = lib_4.CoreModels.EnvironmentName.__, envNumber = undefined) {
        //#region @backendFunc
        const environmentsAbsPath = this.project.pathFor([
            constants_1.environmentsFolder,
            artifactName,
            `env.${artifactName}.${envName}${envNumber ?? ''}.ts`,
        ]);
        lib_8.Helpers.writeFile(environmentsAbsPath, this.getBaseEnvTemplate());
        lib_7.UtilsTypescript.formatFile(environmentsAbsPath);
        //#endregion
    }
    //#endregion
    async watchAndRecreate(onChange) {
        //#region @backendFunc
        if (this.project.framework.isStandaloneProject) {
            const watcher = (0, lib_1.incrementalWatcher)([
                this.project.pathFor(`${constants_1.environmentsFolder}/**/*.ts`),
                this.project.pathFor(`${constants_1.envTs}`),
            ], {
                name: 'Environment Config Watcher',
                ignoreInitial: true,
                followSymlinks: false,
            });
            watcher.on('all', async (event, filePath) => {
                onChange();
            });
        }
        //#endregion
    }
    //#region api / update
    async update(envConfigFromParams, options) {
        //#region @backendFunc
        options = options || {};
        lib_8.Helpers.taskStarted(`${options.fromWatcher ? '(watcher) ' : ''}Updating environment config `);
        envConfigFromParams = options_1.EnvOptions.from(envConfigFromParams);
        this.makeSureEnvironmentExists();
        if (options.saveEnvToLibEnv) {
            if (!options.fromWatcher) {
                this.project.remove(`src/lib/env`);
            }
        }
        const configResult = await this.envOptionsResolve(envConfigFromParams, options.fromWatcher);
        configResult.applyFieldsFrom(envConfigFromParams);
        this.updateGeneratedValues(configResult);
        if (options.saveEnvToLibEnv && this.project.framework.isStandaloneProject) {
            for (const targetArtifact of options_1.ReleaseArtifactTaonNamesArr) {
                const toApplyWithTarget = configResult.clone({
                    release: {
                        targetArtifact,
                    },
                });
                const configResultForTarget = await this.envOptionsResolve(toApplyWithTarget, options.fromWatcher);
                this.saveEnvironmentConfig(configResultForTarget);
            }
            this.project.framework.generateIndexTs(`${constants_1.srcMainProject}/${constants_1.libFromSrc}/${constants_1.TaonGeneratedFolders.ENV_FOLDER}`);
        }
        lib_8.Helpers.taskDone(`${options.fromWatcher ? '(watcher) ' : ''}Done updating environment config `);
        return configResult;
        //#endregion
    }
    //#endregion
    //#endregion
    //#region private methods
    //#region private methods / env options resolve
    envOptionsResolve(envOptions, fromWatcher = false) {
        //#region @backendFunc
        if (!envOptions.release.envName) {
            envOptions.release.envName = '__';
        }
        if (envOptions.release.envName && envOptions.release.targetArtifact) {
            const envConfigForArtifactAndEnvironment = options_1.EnvOptions.from(this.project.environmentConfig.getEnvFor(envOptions.release.targetArtifact, envOptions.release.envName, envOptions.release.envNumber, fromWatcher)).clone({
                // TODO @LAST APPLY ALL FIELDS FROM
                // must be reapplied after cloning envOptions also
                release: {
                    targetArtifact: envOptions.release.targetArtifact,
                    envName: envOptions.release.envName,
                    envNumber: envOptions.release.envNumber,
                },
                copyToManager: {
                    beforeCopyHook: envOptions.copyToManager.beforeCopyHook,
                },
            });
            return envConfigForArtifactAndEnvironment;
        }
        else {
            const mainConfig = options_1.EnvOptions.from(this.getEnvMain());
            return mainConfig;
        }
        //#endregion
    }
    //#endregion
    //#region private methods / get env for
    getEnvFor(artifactName, environmentName, envNum = undefined, fromWatcher = false) {
        //#region @backendFunc
        let env;
        // Helpers.taskStarted(
        //   `${fromWatcher ? '(watcher) ' : ''}Reading environment config for ` +
        //     `${artifactName}/${environmentName}/${envNum || ''}`,
        // );
        var pathToEnvTs = this.project.pathFor(`${constants_1.environmentsFolder}/${artifactName}/` +
            `env.${artifactName}.${environmentName}${envNum === undefined ? '' : envNum}.ts`);
        try {
            // TODO QUICK_FIX
            if (!lib_4.fse.existsSync(pathToEnvTs)) {
                lib_7.HelpersTaon.copyFile((0, lib_4.crossPlatformPath)([
                    lib_5.path.dirname(pathToEnvTs),
                    `env.${artifactName}.${lib_4.CoreModels.EnvironmentName.__}.ts`,
                ]), pathToEnvTs);
            }
            lib_7.UtilsTypescript.clearRequireCacheRecursive(pathToEnvTs);
            // @ts-ignore
            env = require(pathToEnvTs)?.default;
        }
        catch (error) {
            // TODO QUICK_FIX @UNCOMMENT
            if (this.project.framework.isCoreProject) {
                return {};
            }
            const errMsg = (error instanceof Error && error.message) || String(error);
            console.error(errMsg);
            lib_8.Helpers.error(`Incorrect env config for:
         artifactName: ${artifactName}
         environmentName: ${environmentName}
         envNum: ${envNum}
        `);
        }
        // Helpers.taskDone(
        //   `${fromWatcher ? '(watcher) ' : ''}Done reading environment config for ` +
        //     `${artifactName}/${environmentName}/${envNum || ''}`,
        // );
        return env;
        //#endregion
    }
    //#endregion
    //#region private methods / get env main
    getEnvMain() {
        //#region @backendFunc
        // Helpers.taskStarted(`Reading environment config for ${this.project.name}`);
        let configStandaloneEnv;
        try {
            lib_7.UtilsTypescript.clearRequireCacheRecursive(this.absPathToEnvTs);
            configStandaloneEnv = require(this.absPathToEnvTs)?.default;
        }
        catch (error) {
            // TODO QUICK_FIX @UNCOMMENT
            if (this.project.framework.isCoreProject) {
                return {};
            }
            console.log(error);
            lib_8.Helpers.error(`Incorrect env config for:
         project: ${this.project.name}
        `);
        }
        // Helpers.taskDone(
        //   `Done reading environment config for ${this.project.name}`,
        // );
        if (!configStandaloneEnv) {
            lib_8.Helpers.throwError(`Please provide default export in ${this.absPathToEnvTs}`);
        }
        return configStandaloneEnv;
        //#endregion
    }
    //#endregion
    //#region private methods / get base env template
    getBaseEnvTemplate(jsonString = '{ ...baseEnv }') {
        //#region @backendFunc
        const isBase = jsonString === '{ ...baseEnv }';
        const fileToSave = `${'import'} type { EnvOptions } from '${lib_3.tnpPackageName}/${'src'}';
  ${isBase ? `${'import'} baseEnv from '../../${constants_1.envTs.replace('.ts', '')}';` : ''}
  const env: Partial<EnvOptions> = ${jsonString};
  export default env;
  `;
        return fileToSave;
        //#endregion
    }
    //#endregion
    //#region private methods / update generated values
    updateGeneratedValues(envOptions) {
        //#region @backendFunc
        if (this.project.git.isInsideGitRepo && envOptions.release.targetArtifact) {
            // @ts-expect-error overriding readonly property
            envOptions.buildInfo = {
                // number: this.project.git.countCommits(),
                date: this.project.git.lastCommitDate(),
                hash: this.project.git.lastCommitHash(),
            };
        }
        // @ts-expect-error overriding readonly property
        envOptions.currentProjectName = this.project.name;
        // @ts-expect-error overriding readonly property
        envOptions.appId = this.project.taonJson.appId;
        if (this.project.framework.isStandaloneProject) {
            // TODO I think this is not needed anymore - or something better is needed
            envOptions['pathsTsconfig'] =
                `"paths": ` +
                    JSON.stringify({
                        [`${constants_1.DUMMY_LIB}`]: [`./${constants_1.srcMainProject}/${constants_1.libFromSrc}`],
                        [`${constants_1.DUMMY_LIB}/*`]: [`./${constants_1.srcFromTaonImport}/${constants_1.libFromImport}/*`],
                        [`${this.project.nameForNpmPackage}/${constants_1.srcMainProject}`]: [
                            `./${constants_1.srcFromTaonImport}/${constants_1.libFromImport}`,
                        ],
                        [`${this.project.nameForNpmPackage}/${constants_1.srcMainProject}/*`]: [
                            `./${constants_1.srcFromTaonImport}/${constants_1.libFromImport}/*`,
                        ],
                    });
        }
        else if (this.project.framework.isContainer) {
            // TODO
            // console.log(`
            //   container not initing
            //   `);
        }
        if (envOptions['pathsTsconfig'] &&
            !envOptions['pathsTsconfig']?.endsWith(',')) {
            envOptions['pathsTsconfig'] = `${envOptions['pathsTsconfig']},`;
        }
        //#endregion
    }
    //#endregion
    //#region private methods / save config workspace
    saveEnvironmentConfig(projectEnvConfig) {
        //#region @backendFunc
        if (this.project.framework.isStandaloneProject) {
            const backendConfigFileName = `env.${projectEnvConfig.release.targetArtifact}.ts`;
            const backendConstants = [];
            const pathsWithValues = [];
            lib_2.walk.Object(projectEnvConfig, (val, lodashPath, newValue) => {
                if (!lib_6._.isObject(val)) {
                    pathsWithValues.push(lodashPath);
                    backendConstants.push(`// ${lodashPath}
export const ENV_` +
                        `${lib_6._.snakeCase(projectEnvConfig.release.targetArtifact).toUpperCase()}_` +
                        `${lib_6._.snakeCase(lodashPath).replace(/\ /g, '_').toUpperCase()} ` +
                        `= ${lib_6._.isString(val) ? `'${val}'` : val};`);
                }
            }, { walkGetters: false });
            // console.log({ allPathsEnvConfig, pathsWithValues });
            for (const setUndefinedLodashPath of options_1.allPathsEnvConfig) {
                if (!pathsWithValues.includes(setUndefinedLodashPath)) {
                    backendConstants.push(`// ${setUndefinedLodashPath}
export const ENV_` +
                        `${lib_6._.snakeCase(projectEnvConfig.release.targetArtifact).toUpperCase()}_` +
                        `${lib_6._.snakeCase(setUndefinedLodashPath).replace(/\ /g, '_').toUpperCase()} ` +
                        `= undefined;`);
                }
            }
            this.project.writeFile(`${constants_1.srcMainProject}/${constants_1.libFromImport}/${constants_1.TaonGeneratedFolders.ENV_FOLDER}/${backendConfigFileName}`, `${constants_1.THIS_IS_GENERATED_INFO_COMMENT}
${backendConstants.join('\n')}
${constants_1.THIS_IS_GENERATED_INFO_COMMENT}`);
        }
        //#endregion
    }
    //#endregion
    makeSureEnvironmentExists() {
        //#region @backendFunc
        if (!this.project.hasFolder(constants_1.environmentsFolder)) {
            const coreEnv = this.project.ins
                .by(lib_3.LibTypeEnum.ISOMORPHIC_LIB)
                .pathFor(constants_1.environmentsFolder);
            lib_7.HelpersTaon.copy(coreEnv, this.project.pathFor(constants_1.environmentsFolder), {
                recursive: true,
            });
        }
        if (!lib_4.fse.existsSync(this.absPathToEnvTs)) {
            const jsonString = JSON.stringify({
                website: {
                    domain: `${this.project.name}.example.domain.com`,
                    title: lib_6._.startCase(this.project.name),
                    useDomain: true,
                },
                loading: {
                    preAngularBootstrap: {
                        background: '#fdebed', // light pink
                        loader: {
                            name: 'lds-default',
                        },
                    },
                },
            });
            lib_8.Helpers.writeFile(this.absPathToEnvTs, this.getBaseEnvTemplate(jsonString));
            lib_7.UtilsTypescript.formatFile(this.absPathToEnvTs);
        }
        for (const artifactName of options_1.ReleaseArtifactTaonNamesArr) {
            for (const envName of constants_1.coreRequiredEnvironments) {
                const relativePathToArtifacEnv = (0, lib_4.crossPlatformPath)([
                    constants_1.environmentsFolder,
                    artifactName,
                    `env.${artifactName}.${envName}.ts`,
                ]);
                const absPathToArtifactEnv = this.project.pathFor(relativePathToArtifacEnv);
                if (!lib_4.fse.existsSync(absPathToArtifactEnv)) {
                    const coreProjectArtifactPath = this.project.framework.coreProject.pathFor(relativePathToArtifacEnv);
                    lib_7.HelpersTaon.copyFile(coreProjectArtifactPath, absPathToArtifactEnv);
                }
            }
        }
        //#endregion
    }
    get absPathToEnvTs() {
        return (0, lib_4.crossPlatformPath)([this.project.location, constants_1.envTs]);
    }
}
exports.EnvironmentConfig = EnvironmentConfig;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/environment-config/environment-config.js.map