import { LibTypeEnum, UtilsEtcHosts__NS__SIMULATE_DOMAIN_TAG } from 'tnp-core/lib-prod';
import { chalk, fse, Helpers__NS__info, Helpers__NS__logInfo, UtilsNetwork__NS__getEtcHostEntryByComment, UtilsNetwork__NS__getEtcHostsPath, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__select } from 'tnp-core/lib-prod';
import { BaseCliWorkerTerminalUI, } from 'tnp-helpers/lib-prod';
import { DEFAULT_FRAMEWORK_VERSION } from '../../../constants';
//#endregion
export class TaonTerminalUI extends BaseCliWorkerTerminalUI {
    //#region methods / header text
    async headerText() {
        return 'Taon.dev';
    }
    //#endregion
    //#region methods / header
    async header() {
        //#region @backendFunc
        // return super.header();
        let consoleLogoPath;
        let currentVersion = Number(DEFAULT_FRAMEWORK_VERSION.replace('v', ''));
        while (true) {
            try {
                consoleLogoPath = this.worker.ins
                    .by(LibTypeEnum.CONTAINER, `v${currentVersion}`)
                    .pathFor('../__images/logo/logo-console.png');
                break;
            }
            catch (error) {
                currentVersion--;
                // console.log({
                //   error, currentVersion
                // })
                if (currentVersion < 18) {
                    throw new Error('[taon] Could not find console logo image for any version');
                }
            }
        }
        // console.log({ logoLight });
        const pngStringify = require('console-png');
        // consolePng.attachTo(console);
        const image = fse.readFileSync(consoleLogoPath);
        return new Promise((resolve, reject) => {
            pngStringify(image, function (err, string) {
                if (err) {
                    throw err;
                }
                console.log(string);
                resolve();
            });
        });
        //#endregion
    }
    //#endregion
    //#region methods / get domains menu
    async getDomainsMenu() {
        //#region @backendFunc
        while (true) {
            UtilsTerminal__NS__clearConsole();
            try {
                const choices = {
                    back: {
                        name: 'Back to main menu',
                    },
                    listSimulatedDomains: {
                        name: 'List simulated domains (from /etc/hosts file)',
                    },
                };
                const options = await UtilsTerminal__NS__select({
                    choices,
                });
                if (options === 'back') {
                    return;
                }
                if (options === 'listSimulatedDomains') {
                    UtilsTerminal__NS__clearConsole();
                    Helpers__NS__info(`

            Listing of simulated domains (from ${UtilsNetwork__NS__getEtcHostsPath()} file):

            `);
                    const domains = UtilsNetwork__NS__getEtcHostEntryByComment(UtilsEtcHosts__NS__SIMULATE_DOMAIN_TAG);
                    if (domains.length === 0) {
                        await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                            message: 'No simulated domains found. Press any key to continue.',
                        });
                        return;
                    }
                    const domainsSimulated = domains.reduce((acc, curr) => {
                        return acc.concat(curr.domains);
                    }, []);
                    for (let index = 0; index < domainsSimulated.length; index++) {
                        const domain = domainsSimulated[index];
                        Helpers__NS__info(`${index + 1}. ${chalk.bold(domain)}`);
                    }
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
                }
            }
            catch (error) {
                await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                    message: 'Error occurred. Press any key to continue.',
                });
            }
        }
        //#endregion
    }
    //#endregion
    //#region methods / get worker terminal actions
    getWorkerTerminalActions() {
        //#region @backendFunc
        const myActions = {
            //#region enableCloud
            enableCloud: {
                name: '',
                action: async () => {
                    if (this.worker.traefikProvider.cloudIsEnabled) {
                        if (await UtilsTerminal__NS__confirm({
                            message: `Are you sure you want to disable cloud?`,
                        })) {
                            Helpers__NS__logInfo(`Disabling cloud...`);
                            await this.worker.disableCloud();
                        }
                    }
                    else {
                        Helpers__NS__info(`${chalk.bold('Enabling cloud...')}

            port 80 will redirect to port 443
            port 443 will be used for https connections

            Use deployments to deploy your projects.

              `);
                        await this.worker.enableCloud();
                    }
                },
            },
            //#endregion
            //#region projects
            projects: {
                name: 'Manage Taon Projects',
                action: async () => {
                    Helpers__NS__info(`This feature is not yet implemented.`);
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            //#endregion
            //#region ports
            ports: {
                name: 'Manage Ports (TCP/UDP)',
                action: async () => {
                    await this.worker.ins.portsWorker.terminalUI.infoScreen({
                        exitIsOnlyReturn: true,
                    });
                },
            },
            //#endregion
            //#region domains
            domains: {
                name: 'Manage Domains (and /etc/hosts file)',
                action: async () => {
                    await this.getDomainsMenu();
                },
            },
            //#endregion
            //#region deployments
            deployments: {
                name: 'Manage Deployments',
                action: async () => {
                    await this.worker.deploymentsWorker.terminalUI.infoScreen({
                        exitIsOnlyReturn: true,
                    });
                },
            },
            //#endregion
            //#region instances
            instances: {
                name: 'Manage Instances',
                action: async () => {
                    await this.worker.instancesWorker.terminalUI.infoScreen({
                        exitIsOnlyReturn: true,
                    });
                },
            },
            //#endregion
            //#region processes
            processes: {
                name: 'Manage Processes',
                action: async () => {
                    await this.worker.processesWorker.terminalUI.infoScreen({
                        exitIsOnlyReturn: true,
                    });
                },
            },
            //#endregion
            //#region environments
            environments: {
                name: 'Manage Environments',
                action: async () => {
                    console.log('hello world');
                    const ctrl = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'Manage Environments action',
                        },
                    });
                    const list = (await ctrl.getEnvironments().request())?.body.json || [];
                    await UtilsTerminal__NS__previewLongList(list.map(s => `${s.name} ${s.type}`));
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
                },
            },
            //#endregion
            //#region scheduler
            scheduler: {
                name: 'Manage Scheduler',
                action: async () => {
                    console.log('Scheduler in progress... ');
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            //#endregion
            //#region environments
            settings: {
                name: 'Settings',
                action: async () => {
                    console.log('Setting in progress... ');
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            //#endregion
        };
        delete myActions.environments;
        if (this.worker.traefikProvider.cloudIsEnabled) {
            myActions.enableCloud.name = `Disable Cloud ${this.worker.traefikProvider.isDevMode ? '(dev mode)' : ''}`;
        }
        else {
            myActions.enableCloud.name =
                'Enable Cloud (add possibility of deploying projects)';
            delete myActions.deployments;
            delete myActions.projects;
        }
        return {
            ...this.chooseAction,
            ...myActions,
            ...super.getWorkerTerminalActions({ chooseAction: false }),
        };
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/taon-terminal-ui.js.map