"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstancesTerminalUI = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const instances_1 = require("./instances");
//#endregion
class InstancesTerminalUI extends lib_2.BaseCliWorkerTerminalUI {
    async headerText() {
        return null;
    }
    textHeaderStyle() {
        return 'slick';
    }
    getWorkerTerminalActions(options) {
        //#region @backendFunc
        const myActions = {
            getStuffFromBackend: {
                name: 'Get instances list',
                action: async () => {
                    lib_1.Helpers.info(`Fetching list...`);
                    const ctrl = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'Get instances backend terminal action',
                        },
                    });
                    const list = (await ctrl.getEntities().request())?.body.json || [];
                    console.log(list.map(c => `- ${c.id} ${c.name} ${c.ipAddress}`).join('\n'));
                    lib_1.Helpers.info(`Fetched ${list.length} entities`);
                    await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            deleteInstance: {
                name: 'Delete instance',
                action: async () => {
                    lib_1.Helpers.info(`Fetching list...`);
                    const ctrl = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'Get stuff from backend action',
                        },
                    });
                    const list = (await ctrl.getEntities().request())?.body.json || [];
                    const choices = list.map(c => ({
                        name: `${c.id} ${c.name} ${c.ipAddress}`,
                        value: c.id,
                    }));
                    const id = await lib_1.UtilsTerminal.select({
                        question: 'Select instance to delete',
                        autocomplete: true,
                        choices: [{ name: '- back -', value: '' }, ...choices],
                    });
                    const instance = id && list.find(l => l.id === id);
                    if (instance) {
                        lib_1.Helpers.info(`Deleting instance with

              ip:${instance.ipAddress}
              name:${instance.name}

              `);
                        if (await lib_1.UtilsTerminal.confirm({
                            message: 'Are you sure you want this instance ?',
                        })) {
                            try {
                                lib_1.Helpers.taskStarted('Deleting instance');
                                await ctrl.delete(instance.id).request();
                                await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync({
                                    message: 'Instance deleted. Press any key to go back to main menu',
                                });
                            }
                            catch (error) {
                                await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync({
                                    message: 'Error deleting instance. Press any key to go back to main menu',
                                });
                            }
                        }
                    }
                },
            },
            insertDeployment: {
                name: 'Create new instance',
                action: async () => {
                    lib_1.Helpers.info(`Inserting new deployment`);
                    const ctrl = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'Insert new deployment action',
                        },
                    });
                    while (true) {
                        try {
                            //#region terminal form
                            const ipAddress = await lib_1.UtilsTerminal.input({
                                required: true,
                                question: 'Enter IP address of the instance',
                                validate: val => {
                                    if (val?.trim() === lib_1.CoreModels.localhostIp127) {
                                        return false;
                                    }
                                    if (val?.trim() === 'localhost') {
                                        return false;
                                    }
                                    return lib_1.UtilsNetwork.isValidIp(val);
                                },
                            });
                            const nameOfInstance = await lib_1.UtilsTerminal.input({
                                required: true,
                                question: 'Enter name of instance',
                                validate: val => {
                                    if (!val || val.trim() === '') {
                                        return false;
                                    }
                                    return val.trim().length > 3;
                                },
                            });
                            //#endregion
                            const instance = await ctrl
                                .insertEntity(new instances_1.Instances().clone({
                                ipAddress,
                                name: nameOfInstance,
                            }))
                                .request()
                                .then(r => r.body.json);
                            await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync({
                                message: `Instance (id=${instance.id}) created. Press any key to go back to main menu`,
                            });
                            break;
                        }
                        catch (error) {
                            //#region error handling
                            if (await lib_1.UtilsTerminal.confirm({
                                message: 'Error creating instance. Try again ?',
                            })) {
                                continue;
                            }
                            else {
                                break;
                            }
                            //#endregion
                        }
                    }
                },
            },
        };
        return {
            ...this.chooseAction,
            ...myActions,
            ...super.getWorkerTerminalActions({
                ...options,
                chooseAction: false,
            }),
        };
        //#endregion
    }
}
exports.InstancesTerminalUI = InstancesTerminalUI;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/instances/instances.terminal-ui.js.map