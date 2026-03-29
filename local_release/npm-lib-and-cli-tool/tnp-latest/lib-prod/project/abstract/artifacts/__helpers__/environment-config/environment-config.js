//#region imports
import { incrementalWatcher } from 'incremental-compiler/lib-prod';
import { walk } from 'lodash-walk-object/lib-prod';
import { LibTypeEnum, tnpPackageName } from 'tnp-core/lib-prod';
import { crossPlatformPath, fse, CoreModels__NS__EnvironmentName } from 'tnp-core/lib-prod';
import { path } from 'tnp-core/lib-prod';
import { ___NS__isObject, ___NS__isString, ___NS__snakeCase, ___NS__startCase } from 'tnp-core/lib-prod';
import { BaseFeatureForProject, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__formatFile } from 'tnp-helpers/lib-prod';
import { Helpers__NS__error, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__writeFile } from 'tnp-helpers/lib-prod';
import { register } from 'ts-node';
import { coreRequiredEnvironments, DUMMY_LIB, environmentsFolder, envTs, libFromImport, libFromSrc, srcFromTaonImport, srcMainProject, TaonGeneratedFolders, THIS_IS_GENERATED_INFO_COMMENT, } from '../../../../../constants';
import { allPathsEnvConfig, EnvOptions, ReleaseArtifactTaonNamesArr, } from '../../../../../options';
//#endregion
//#region @backend
try {
    register({
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
export class EnvironmentConfig // @ts-ignore TODO weird inheritance problem
// @ts-ignore TODO weird inheritance problem
 extends BaseFeatureForProject {
    //#region api
    //#region api / create artifact
    async createForArtifact(artifactName, envName = CoreModels__NS__EnvironmentName.__, envNumber = undefined) {
        //#region @backendFunc
        const environmentsAbsPath = this.project.pathFor([
            environmentsFolder,
            artifactName,
            `env.${artifactName}.${envName}${envNumber ?? ''}.ts`,
        ]);
        Helpers__NS__writeFile(environmentsAbsPath, this.getBaseEnvTemplate());
        UtilsTypescript__NS__formatFile(environmentsAbsPath);
        //#endregion
    }
    //#endregion
    async watchAndRecreate(onChange) {
        //#region @backendFunc
        if (this.project.framework.isStandaloneProject) {
            const watcher = incrementalWatcher([
                this.project.pathFor(`${environmentsFolder}/**/*.ts`),
                this.project.pathFor(`${envTs}`),
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
        Helpers__NS__taskStarted(`${options.fromWatcher ? '(watcher) ' : ''}Updating environment config `);
        envConfigFromParams = EnvOptions.from(envConfigFromParams);
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
            for (const targetArtifact of ReleaseArtifactTaonNamesArr) {
                const toApplyWithTarget = configResult.clone({
                    release: {
                        targetArtifact,
                    },
                });
                const configResultForTarget = await this.envOptionsResolve(toApplyWithTarget, options.fromWatcher);
                this.saveEnvironmentConfig(configResultForTarget);
            }
            this.project.framework.generateIndexTs(`${srcMainProject}/${libFromSrc}/${TaonGeneratedFolders.ENV_FOLDER}`);
        }
        Helpers__NS__taskDone(`${options.fromWatcher ? '(watcher) ' : ''}Done updating environment config `);
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
            const envConfigForArtifactAndEnvironment = EnvOptions.from(this.project.environmentConfig.getEnvFor(envOptions.release.targetArtifact, envOptions.release.envName, envOptions.release.envNumber, fromWatcher)).clone({
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
            const mainConfig = EnvOptions.from(this.getEnvMain());
            return mainConfig;
        }
        //#endregion
    }
    //#endregion
    //#region private methods / get env for
    getEnvFor(artifactName, environmentName, envNum = undefined, fromWatcher = false) {
        //#region @backendFunc
        let env;
        // Helpers__NS__taskStarted(
        //   `${fromWatcher ? '(watcher) ' : ''}Reading environment config for ` +
        //     `${artifactName}/${environmentName}/${envNum || ''}`,
        // );
        var pathToEnvTs = this.project.pathFor(`${environmentsFolder}/${artifactName}/` +
            `env.${artifactName}.${environmentName}${envNum === undefined ? '' : envNum}.ts`);
        try {
            // TODO QUICK_FIX
            if (!fse.existsSync(pathToEnvTs)) {
                HelpersTaon__NS__copyFile(crossPlatformPath([
                    path.dirname(pathToEnvTs),
                    `env.${artifactName}.${CoreModels__NS__EnvironmentName.__}.ts`,
                ]), pathToEnvTs);
            }
            UtilsTypescript__NS__clearRequireCacheRecursive(pathToEnvTs);
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
            Helpers__NS__error(`Incorrect env config for:
         artifactName: ${artifactName}
         environmentName: ${environmentName}
         envNum: ${envNum}
        `);
        }
        // Helpers__NS__taskDone(
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
        // Helpers__NS__taskStarted(`Reading environment config for ${this.project.name}`);
        let configStandaloneEnv;
        try {
            UtilsTypescript__NS__clearRequireCacheRecursive(this.absPathToEnvTs);
            configStandaloneEnv = require(this.absPathToEnvTs)?.default;
        }
        catch (error) {
            // TODO QUICK_FIX @UNCOMMENT
            if (this.project.framework.isCoreProject) {
                return {};
            }
            console.log(error);
            Helpers__NS__error(`Incorrect env config for:
         project: ${this.project.name}
        `);
        }
        // Helpers__NS__taskDone(
        //   `Done reading environment config for ${this.project.name}`,
        // );
        if (!configStandaloneEnv) {
            Helpers__NS__throwError(`Please provide default export in ${this.absPathToEnvTs}`);
        }
        return configStandaloneEnv;
        //#endregion
    }
    //#endregion
    //#region private methods / get base env template
    getBaseEnvTemplate(jsonString = '{ ...baseEnv }') {
        //#region @backendFunc
        const isBase = jsonString === '{ ...baseEnv }';
        const fileToSave = `${'import'} type { EnvOptions } from '${tnpPackageName}/${'src'}';
  ${isBase ? `${'import'} baseEnv from '../../${envTs.replace('.ts', '')}';` : ''}
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
                        [`${DUMMY_LIB}`]: [`./${srcMainProject}/${libFromSrc}`],
                        [`${DUMMY_LIB}/*`]: [`./${srcFromTaonImport}/${libFromImport}/*`],
                        [`${this.project.nameForNpmPackage}/${srcMainProject}`]: [
                            `./${srcFromTaonImport}/${libFromImport}`,
                        ],
                        [`${this.project.nameForNpmPackage}/${srcMainProject}/*`]: [
                            `./${srcFromTaonImport}/${libFromImport}/*`,
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
            walk.Object(projectEnvConfig, (val, lodashPath, newValue) => {
                if (!___NS__isObject(val)) {
                    pathsWithValues.push(lodashPath);
                    backendConstants.push(`// ${lodashPath}
export const ENV_` +
                        `${___NS__snakeCase(projectEnvConfig.release.targetArtifact).toUpperCase()}_` +
                        `${___NS__snakeCase(lodashPath).replace(/\ /g, '_').toUpperCase()} ` +
                        `= ${___NS__isString(val) ? `'${val}'` : val};`);
                }
            }, { walkGetters: false });
            // console.log({ allPathsEnvConfig, pathsWithValues });
            for (const setUndefinedLodashPath of allPathsEnvConfig) {
                if (!pathsWithValues.includes(setUndefinedLodashPath)) {
                    backendConstants.push(`// ${setUndefinedLodashPath}
export const ENV_` +
                        `${___NS__snakeCase(projectEnvConfig.release.targetArtifact).toUpperCase()}_` +
                        `${___NS__snakeCase(setUndefinedLodashPath).replace(/\ /g, '_').toUpperCase()} ` +
                        `= undefined;`);
                }
            }
            this.project.writeFile(`${srcMainProject}/${libFromImport}/${TaonGeneratedFolders.ENV_FOLDER}/${backendConfigFileName}`, `${THIS_IS_GENERATED_INFO_COMMENT}
${backendConstants.join('\n')}
${THIS_IS_GENERATED_INFO_COMMENT}`);
        }
        //#endregion
    }
    //#endregion
    makeSureEnvironmentExists() {
        //#region @backendFunc
        if (!this.project.hasFolder(environmentsFolder)) {
            const coreEnv = this.project.ins
                .by(LibTypeEnum.ISOMORPHIC_LIB)
                .pathFor(environmentsFolder);
            HelpersTaon__NS__copy(coreEnv, this.project.pathFor(environmentsFolder), {
                recursive: true,
            });
        }
        if (!fse.existsSync(this.absPathToEnvTs)) {
            const jsonString = JSON.stringify({
                website: {
                    domain: `${this.project.name}.example.domain.com`,
                    title: ___NS__startCase(this.project.name),
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
            Helpers__NS__writeFile(this.absPathToEnvTs, this.getBaseEnvTemplate(jsonString));
            UtilsTypescript__NS__formatFile(this.absPathToEnvTs);
        }
        for (const artifactName of ReleaseArtifactTaonNamesArr) {
            for (const envName of coreRequiredEnvironments) {
                const relativePathToArtifacEnv = crossPlatformPath([
                    environmentsFolder,
                    artifactName,
                    `env.${artifactName}.${envName}.ts`,
                ]);
                const absPathToArtifactEnv = this.project.pathFor(relativePathToArtifacEnv);
                if (!fse.existsSync(absPathToArtifactEnv)) {
                    const coreProjectArtifactPath = this.project.framework.coreProject.pathFor(relativePathToArtifacEnv);
                    HelpersTaon__NS__copyFile(coreProjectArtifactPath, absPathToArtifactEnv);
                }
            }
        }
        //#endregion
    }
    get absPathToEnvTs() {
        return crossPlatformPath([this.project.location, envTs]);
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/__helpers__/environment-config/environment-config.js.map