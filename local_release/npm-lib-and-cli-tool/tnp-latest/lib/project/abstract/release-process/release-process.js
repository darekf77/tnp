"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseProcess = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const lib_4 = require("tnp-helpers/lib");
const app_utils_1 = require("../../../app-utils");
const constants_1 = require("../../../constants");
const options_1 = require("../../../options");
// import { ReleaseConfig } from './release-config';
//#endregion
/**
 * manage standalone or container release process
 */ // @ts-ignore TODO weird inheritance problem
class ReleaseProcess extends lib_4.BaseReleaseProcess {
    // config = new ReleaseConfig(this.project);
    //#region constructor
    constructor(project) {
        super(project);
    }
    //#endregion
    //#region display release process menu
    async displayReleaseProcessMenu(envOptions) {
        //#region @backendFunc
        while (true) {
            lib_2.UtilsTerminal.clearConsole();
            //#region return if not projects
            if (this.project.framework.isContainer &&
                this.project.children.length === 0) {
                console.info(`No projects to release inside ${lib_2.chalk.bold(this.project.genericName)} container`);
                await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                    message: 'Press any key to exit...',
                });
                return;
            }
            //#endregion
            const manual = 'manual';
            const cloud = 'cloud';
            const local = 'local';
            const staticPages = 'static-pages';
            const priovider = lib_2._.upperFirst(lib_2._.first(this.project.git.remoteProvider?.split('.'))) ||
                'unknow';
            // const { actionResult } =
            await lib_2.UtilsTerminal.selectActionAndExecute({
                readInfo: {
                    name: 'READ INFO ABOUT RELEASE TYPES',
                    action: async () => {
                        lib_2.UtilsTerminal.clearConsole();
                        //#region info
                        console.info(`
${lib_2.chalk.bold.green('Manual release')} => for everything whats Taon supports
        - everything is done here manually, you have to provide options
        - config saved during release process can be use for 'Cloud release' later
${lib_2.chalk.bold.blue('Cloud release')} => trigger remote release action on server (local or remote)
        - trigger release base on config stored inside cloud
        - use local Taon Cloud or login to remote Taon Cloud
${lib_2.chalk.bold.gray('Local release')} => use current git repo for storing release data
        - for anything that you want to backup inside your git repository
${lib_2.chalk.bold.yellow('Static Pages release')} => use specific branch for storing release data
        - perfect for github pages, gitlab pages and similar solutions
        `.trimStart());
                        //#endregion
                        await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({});
                    },
                },
                [manual]: {
                    //#region manual
                    name: `${this.getColoredTextItem(manual)} Taon release + create config for Cloud`,
                    action: async () => {
                        if (await this.releaseByType(manual, envOptions)) {
                            process.exit(0);
                        }
                    },
                    //#endregion
                },
                [cloud]: {
                    //#region cloud
                    name: `${this.getColoredTextItem(cloud)} release tirgger for Taon Cloud`,
                    action: async () => {
                        if (await this.releaseByType(cloud, envOptions)) {
                            process.exit(0);
                        }
                    },
                    //#endregion
                },
                [local]: {
                    //#region local
                    name: `${this.getColoredTextItem(local)} release to current git repository`,
                    action: async () => {
                        if (await this.releaseByType(local, envOptions)) {
                            process.exit(0);
                        }
                    },
                    //#endregion
                },
                [staticPages]: {
                    //#region local
                    name: `${this.getColoredTextItem(staticPages)} release for ${priovider} pages`,
                    action: async () => {
                        if (await this.releaseByType(staticPages, envOptions)) {
                            process.exit(0);
                        }
                    },
                    //#endregion
                },
            }, {
                autocomplete: false,
                question: `Select release type for this ` +
                    `${this.project.framework.isContainer ? lib_1.LibTypeEnum.CONTAINER : 'standalone'} project ?`,
            });
        }
        //#endregion
    }
    //#endregion
    //#region release by type
    async releaseByType(releaseType, envOptions) {
        //#region @backendFunc
        envOptions.release.releaseType = releaseType;
        const selectedProjects = await this.project.releaseProcess.displayProjectsSelectionMenu(envOptions);
        const releaseArtifactsTaon = await this.displaySelectArtifactsMenu(envOptions, selectedProjects, app_utils_1.ALLOWED_TO_RELEASE[releaseType]);
        if (releaseArtifactsTaon.length > 0) {
            if (!envOptions.release.releaseVersionBumpType) {
                if (envOptions.release.autoReleaseUsingConfig) {
                    envOptions.release.releaseVersionBumpType =
                        lib_2.CoreModels.ReleaseVersionTypeEnum.PATCH;
                }
                else {
                    envOptions.release.releaseVersionBumpType =
                        await this.selectReleaseType(bumpType => this.project.packageJson.resolvePossibleNewVersion(bumpType), {
                            quesitonPrefixMessage: `${envOptions.release.releaseType}${constants_1.releaseSuffix}`,
                        });
                }
            }
        }
        else {
            lib_3.Helpers.warn(`No release artifacts selected for release process`);
            await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
            return false;
        }
        return await this.releaseArtifacts(releaseType, releaseArtifactsTaon, selectedProjects, envOptions);
        //#endregion
    }
    //#endregion
    //#region get environment names by artifact
    getEnvNamesByArtifact(artifact) {
        //#region @backendFunc
        if (!artifact) {
            throw new Error('Artifact is required');
        }
        const pathToEnvFolder = this.project.pathFor([
            constants_1.environmentsFolder,
            artifact,
        ]);
        const files = lib_3.Helpers.getFilesFrom(pathToEnvFolder, {
            recursive: false,
        });
        return files
            .map(f => lib_2.path.basename(f))
            .filter(f => f.startsWith('env.') && f.endsWith('.ts'))
            .map(f => {
            const env = f.replace(`env.${artifact}.`, '').replace('.ts', '');
            const envRemovedNumbers = env.replace(/\d/g, '');
            const envNumber = parseInt(env.replace(envRemovedNumbers, ''));
            return {
                envName: envRemovedNumbers,
                envNumber: !isNaN(envNumber) ? envNumber : undefined,
            };
        })
            .sort((a, b) => {
            if (a.envNumber && b.envNumber) {
                return a.envNumber - b.envNumber;
            }
            if (a.envName === '__') {
                return -1;
            }
            if (b.envName === '__') {
                return 1;
            }
            return 0;
        });
        //#endregion
    }
    //#endregion
    //#region display projects selection menu
    async displayProjectsSelectionMenu(envOptions) {
        //#region @backendFunc
        const selectedProjects = [this.project];
        if (this.project.framework.isStandaloneProject) {
            return selectedProjects;
        }
        while (true) {
            lib_2.UtilsTerminal.clearConsole();
            // console.info(this.getReleaseHeader()); TODO UNCOMMET
            const choices = this.project.children.map(c => {
                return {
                    name: c.genericName,
                    value: c.location,
                };
            });
            const selectAll = await lib_2.UtilsTerminal.confirm({
                message: `Use all ${this.project.children.length} children projects in release process ?`,
            });
            if (selectAll) {
                selectedProjects.unshift(...this.project.children);
                return selectedProjects;
            }
            const selectedLocations = await lib_2.UtilsTerminal.multiselect({
                choices,
                question: `Select projects to release in ${this.project.genericName} container ?`,
            });
            if (selectedLocations.length > 0) {
                selectedProjects.unshift(...selectedLocations.map(location => this.project.ins.From(location)));
                return selectedProjects;
            }
        }
        //#endregion
    }
    //#endregion
    //#region display artifacts menu
    async displaySelectArtifactsMenu(envOptions, selectedProjects, allowedArtifacts) {
        //#region @backendFunc
        while (true) {
            lib_2.UtilsTerminal.clearConsole();
            // console.info(this.getReleaseHeader('')); // TODO UNCOMMET
            const choices = options_1.ReleaseArtifactTaonNamesArr.filter(f => {
                // if (Array.isArray(allowedArtifacts)) {
                //   return allowedArtifacts.includes(f as ReleaseArtifactTaon);
                // }
                return true;
            }).reduce((acc, curr) => {
                return lib_2._.merge(acc, {
                    [curr]: {
                        name: `${lib_2._.upperFirst(lib_2._.startCase(curr))} release`,
                        disabled: Array.isArray(allowedArtifacts) &&
                            !allowedArtifacts.includes(curr),
                    },
                });
            }, {});
            const allDisabled = Object.values(choices).every(c => c.disabled);
            if (allDisabled) {
                if (!envOptions.release.autoReleaseUsingConfig) {
                    lib_3.Helpers.warn(`No release artifacts available for this release type`);
                }
                return [];
            }
            const { selected } = await lib_2.UtilsTerminal.multiselectActionAndExecute(choices, {
                autocomplete: false,
                question: `[${envOptions.release.releaseType}-release] Select release artifacts for this ` +
                    `${this.project.framework.isContainer
                        ? `container's ${selectedProjects.length} projects`
                        : 'standalone project'} ?`,
            });
            if (!selected || selected.length === 0) {
                continue;
            }
            return selected;
        }
        //#endregion
    }
    //#endregion
    //#region public methods / start release
    // @ts-ignore TODO weird inheritance problem
    async startRelease(envOptions) {
        //#region @backendFunc
        if (!envOptions.release.envName) {
            if (!envOptions.release.autoReleaseUsingConfig) {
                const environments = this.getEnvNamesByArtifact(envOptions.release.targetArtifact);
                let selected;
                lib_3.Helpers.info(`Release environment for ${lib_2.chalk.bold(envOptions.release.targetArtifact)}`);
                if (environments.length == 0) {
                    this.project.environmentConfig.createForArtifact(envOptions.release.targetArtifact);
                    selected = {
                        envName: '__',
                    };
                }
                else if (environments.length === 1) {
                    selected = environments[0];
                }
                else {
                    const selectedEnv = await lib_2.UtilsTerminal.select({
                        choices: environments
                            .filter(e => {
                            if (envOptions.release.targetArtifact !== 'angular-node-app') {
                                return true;
                            }
                            return e.envName !== '__';
                        }) // filter out default env from selection
                            .map(e => {
                            return {
                                name: e.envName === '__' ? '__ ( default )' : e.envName,
                                value: e.envName,
                            };
                        }),
                        question: `[${envOptions?.release.releaseType}-release] Select environment`,
                        autocomplete: true,
                    });
                    selected = environments.find(e => e.envName === selectedEnv);
                }
                envOptions.release.envName = selected.envName;
                envOptions.release.envNumber = selected.envNumber;
            }
        }
        await this.project.release(envOptions);
        //#endregion
    }
    //#endregion
    //#region private methods / release artifacts for each project
    /**
     * return true if everything went ok
     */
    async releaseArtifacts(releaseType, releaseArtifactsTaon, selectedProjects, envOptions) {
        //#region @backendFunc
        for (const project of selectedProjects) {
            for (const targetArtifact of releaseArtifactsTaon) {
                await project.releaseProcess.startRelease(options_1.EnvOptions.from({
                    ...envOptions,
                    release: {
                        ...envOptions.release,
                        targetArtifact,
                        releaseType,
                    },
                }));
            }
        }
        await this.pushReleaseCommits();
        return true;
        //#endregion
    }
    //#endregion
    //#region private methods / push container release commit
    /**
     * does not matter if container is releasing standalone
     * or organization packages -> release commit is pushed
     */
    async pushReleaseCommits() {
        //#region @backend
        return void 0; // TODO implement
        //#endregion
    }
    //#endregion
    //#region private methods / get release header
    getReleaseHeader(releaseProcessType) {
        //#region @backendFunc
        // if (this.project.framework.isContainer) {
        //   return (
        //     `
        //       ${this.getColoredTextItem(releaseProcessType)}` +
        //     ` release of ${this.selectedProjects.length} ` +
        //     `projects inside ${chalk.bold(this.project.genericName)}
        //       `
        //   );
        // }
        // return (
        //   `
        //         ${this.getColoredTextItem(releaseProcessType)}` +
        //   ` release of ${chalk.bold(this.project.genericName)}
        //         `
        // );
        //#endregion
    }
    //#endregion
    //#region private methods / get colored text item
    getColoredTextItem(releaseProcessType) {
        //#region @backendFunc
        if (releaseProcessType === 'manual') {
            return lib_2._.upperFirst(lib_2.chalk.bold.green('Manual'));
        }
        if (releaseProcessType === 'cloud') {
            return lib_2._.upperFirst(lib_2.chalk.bold.blue('Cloud'));
        }
        if (releaseProcessType === 'local') {
            return lib_2._.upperFirst(lib_2.chalk.bold.gray('Local'));
        }
        if (releaseProcessType === 'static-pages') {
            return lib_2._.upperFirst(lib_2.chalk.bold.yellow('Static Pages'));
        }
        //#endregion
    }
}
exports.ReleaseProcess = ReleaseProcess;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/release-process/release-process.js.map