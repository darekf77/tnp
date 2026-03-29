//#region imports
import { LibTypeEnum } from 'tnp-core/lib-prod';
import { chalk, path, ___NS__first, ___NS__merge, ___NS__startCase, ___NS__upperFirst, CoreModels__NS__ReleaseVersionTypeEnum, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute } from 'tnp-core/lib-prod';
import { Helpers__NS__getFilesFrom, Helpers__NS__info, Helpers__NS__warn } from 'tnp-helpers/lib-prod';
import { BaseReleaseProcess } from 'tnp-helpers/lib-prod';
import { ALLOWED_TO_RELEASE } from '../../../app-utils';
import { environmentsFolder, releaseSuffix } from '../../../constants';
import { ReleaseArtifactTaonNamesArr, EnvOptions, } from '../../../options';
// import { ReleaseConfig } from './release-config';
//#endregion
/**
 * manage standalone or container release process
 */ // @ts-ignore TODO weird inheritance problem
export class ReleaseProcess extends BaseReleaseProcess {
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
            UtilsTerminal__NS__clearConsole();
            //#region return if not projects
            if (this.project.framework.isContainer &&
                this.project.children.length === 0) {
                console.info(`No projects to release inside ${chalk.bold(this.project.genericName)} container`);
                await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                    message: 'Press any key to exit...',
                });
                return;
            }
            //#endregion
            const manual = 'manual';
            const cloud = 'cloud';
            const local = 'local';
            const staticPages = 'static-pages';
            const priovider = ___NS__upperFirst(___NS__first(this.project.git.remoteProvider?.split('.'))) ||
                'unknow';
            // const { actionResult } =
            await UtilsTerminal__NS__selectActionAndExecute({
                readInfo: {
                    name: 'READ INFO ABOUT RELEASE TYPES',
                    action: async () => {
                        UtilsTerminal__NS__clearConsole();
                        //#region info
                        console.info(`
${chalk.bold.green('Manual release')} => for everything whats Taon supports
        - everything is done here manually, you have to provide options
        - config saved during release process can be use for 'Cloud release' later
${chalk.bold.blue('Cloud release')} => trigger remote release action on server (local or remote)
        - trigger release base on config stored inside cloud
        - use local Taon Cloud or login to remote Taon Cloud
${chalk.bold.gray('Local release')} => use current git repo for storing release data
        - for anything that you want to backup inside your git repository
${chalk.bold.yellow('Static Pages release')} => use specific branch for storing release data
        - perfect for github pages, gitlab pages and similar solutions
        `.trimStart());
                        //#endregion
                        await UtilsTerminal__NS__pressAnyKeyToContinueAsync({});
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
                    `${this.project.framework.isContainer ? LibTypeEnum.CONTAINER : 'standalone'} project ?`,
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
        const releaseArtifactsTaon = await this.displaySelectArtifactsMenu(envOptions, selectedProjects, ALLOWED_TO_RELEASE[releaseType]);
        if (releaseArtifactsTaon.length > 0) {
            if (!envOptions.release.releaseVersionBumpType) {
                if (envOptions.release.autoReleaseUsingConfig) {
                    envOptions.release.releaseVersionBumpType =
                        CoreModels__NS__ReleaseVersionTypeEnum.PATCH;
                }
                else {
                    envOptions.release.releaseVersionBumpType =
                        await this.selectReleaseType(bumpType => this.project.packageJson.resolvePossibleNewVersion(bumpType), {
                            quesitonPrefixMessage: `${envOptions.release.releaseType}${releaseSuffix}`,
                        });
                }
            }
        }
        else {
            Helpers__NS__warn(`No release artifacts selected for release process`);
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
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
            environmentsFolder,
            artifact,
        ]);
        const files = Helpers__NS__getFilesFrom(pathToEnvFolder, {
            recursive: false,
        });
        return files
            .map(f => path.basename(f))
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
            UtilsTerminal__NS__clearConsole();
            // console.info(this.getReleaseHeader()); TODO UNCOMMET
            const choices = this.project.children.map(c => {
                return {
                    name: c.genericName,
                    value: c.location,
                };
            });
            const selectAll = await UtilsTerminal__NS__confirm({
                message: `Use all ${this.project.children.length} children projects in release process ?`,
            });
            if (selectAll) {
                selectedProjects.unshift(...this.project.children);
                return selectedProjects;
            }
            const selectedLocations = await UtilsTerminal__NS__multiselect({
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
            UtilsTerminal__NS__clearConsole();
            // console.info(this.getReleaseHeader('')); // TODO UNCOMMET
            const choices = ReleaseArtifactTaonNamesArr.filter(f => {
                // if (Array.isArray(allowedArtifacts)) {
                //   return allowedArtifacts.includes(f as ReleaseArtifactTaon);
                // }
                return true;
            }).reduce((acc, curr) => {
                return ___NS__merge(acc, {
                    [curr]: {
                        name: `${___NS__upperFirst(___NS__startCase(curr))} release`,
                        disabled: Array.isArray(allowedArtifacts) &&
                            !allowedArtifacts.includes(curr),
                    },
                });
            }, {});
            const allDisabled = Object.values(choices).every(c => c.disabled);
            if (allDisabled) {
                if (!envOptions.release.autoReleaseUsingConfig) {
                    Helpers__NS__warn(`No release artifacts available for this release type`);
                }
                return [];
            }
            const { selected } = await UtilsTerminal__NS__multiselectActionAndExecute(choices, {
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
                Helpers__NS__info(`Release environment for ${chalk.bold(envOptions.release.targetArtifact)}`);
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
                    const selectedEnv = await UtilsTerminal__NS__select({
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
                await project.releaseProcess.startRelease(EnvOptions.from({
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
            return ___NS__upperFirst(chalk.bold.green('Manual'));
        }
        if (releaseProcessType === 'cloud') {
            return ___NS__upperFirst(chalk.bold.blue('Cloud'));
        }
        if (releaseProcessType === 'local') {
            return ___NS__upperFirst(chalk.bold.gray('Local'));
        }
        if (releaseProcessType === 'static-pages') {
            return ___NS__upperFirst(chalk.bold.yellow('Static Pages'));
        }
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/release-process/release-process.js.map