"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Test = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const base_cli_1 = require("./base-cli");
//#endregion
const runners = [
    'vite',
    //  'mocha', 'jest', 'cypress'
];
// @ts-ignore TODO weird inheritance problem
class $Test extends base_cli_1.BaseCli {
    // async __initialize__(): Promise<void> {
    //   Helpers.error(
    //     `UNIT/E2E tests command not implement yet. WORK IN PROGRESS.`,
    //     false,
    //     true,
    //   );
    // }
    //#region aliases
    // constructor(...args) {
    //   // @ts-ignore
    //   super(...args);
    //   for (const runner of runners) {
    //     const upper = runner.toUpperCase();
    //     // RUN
    //     (this as any)[upper] = async () => this._runRunner(runner, false, false);
    //     // RUN DEBUG
    //     (this as any)[`${upper}_DEBUG`] = async () =>
    //       this._runRunner(runner, false, true);
    //     // WATCH
    //     (this as any)[`${upper}_WATCH`] = async () =>
    //       this._runRunner(runner, true, false);
    //     // WATCH DEBUG
    //     (this as any)[`${upper}_WATCH_DEBUG`] = async () =>
    //       this._runRunner(runner, true, true);
    //   }
    // }
    //#endregion
    //#region command methods
    async _() {
        await this._testSelectors(false, false);
    }
    async WATCH() {
        await this._testSelectors(true, false);
    }
    // async WATCH_DEBUG() {
    //   await this._testSelectors(true, true);
    // }
    // async DEBUG() {
    //   await this._testSelectors(false, true);
    // }
    //#endregion
    //#region 🔥 unified selector
    async _testSelectors(watch, debug) {
        //#region @backendFunc
        if (!this.project.framework.isStandaloneProject) {
            lib_2.Helpers.error(`[${lib_1.config.frameworkName}] Not supported test command`, false, true);
        }
        const firstArg = this.firstArg;
        const argIsOption = runners.includes(firstArg);
        if (argIsOption) {
            this.args = this.args.filter(f => f !== firstArg);
        }
        const selected = argIsOption
            ? firstArg
            : await lib_2.HelpersTaon.consoleGui.select(`What do you want to test ? ${!watch ? '(single run ' : '(watch mode '} ${debug ? '- with debugger' : ''})`, runners.map(r => ({
                name: r.toUpperCase(),
                value: r,
            })));
        await this._runRunner(selected, watch, debug);
        //#endregion
    }
    //#endregion
    //#region 🔥 single unified runner executor
    async _runRunner(runner, watch, debug) {
        //#region @backendFunc
        const args = this.args;
        // await this.project.init(
        //   EnvOptions.from({
        //     purpose: `initing before ${runner} tests`,
        //   }),
        // );
        const artifact = this.project.artifactsManager.artifact.npmLibAndCliTool;
        const map = {
            vite: artifact.testsVite,
            mocha: artifact.testsMocha,
            jest: artifact.testsJest,
            cypress: artifact.testsCypress,
        };
        const instance = map[runner];
        if (!instance) {
            this._exit();
            return;
        }
        const parsedArgs = args.filter(Boolean);
        if (watch) {
            await instance.startAndWatch(parsedArgs, debug);
        }
        else {
            await instance.start(parsedArgs, debug);
            this._exit();
        }
        //#endregion
    }
}
exports.$Test = $Test;
exports.default = {
    $Test: lib_2.HelpersTaon.CLIWRAP($Test, '$Test'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-TEST.js.map