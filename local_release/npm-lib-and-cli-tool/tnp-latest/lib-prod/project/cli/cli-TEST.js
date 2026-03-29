//#region imports
import { config } from 'tnp-core/lib-prod';
import { Helpers__NS__error, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__select } from 'tnp-helpers/lib-prod';
import { BaseCli } from './base-cli';
//#endregion
const runners = [
    'vite',
    //  'mocha', 'jest', 'cypress'
];
// @ts-ignore TODO weird inheritance problem
export class $Test extends BaseCli {
    // async __initialize__(): Promise<void> {
    //   Helpers__NS__error(
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
            Helpers__NS__error(`[${config.frameworkName}] Not supported test command`, false, true);
        }
        const firstArg = this.firstArg;
        const argIsOption = runners.includes(firstArg);
        if (argIsOption) {
            this.args = this.args.filter(f => f !== firstArg);
        }
        const selected = argIsOption
            ? firstArg
            : await HelpersTaon__NS__consoleGui__NS__select(`What do you want to test ? ${!watch ? '(single run ' : '(watch mode '} ${debug ? '- with debugger' : ''})`, runners.map(r => ({
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
export default {
    $Test: HelpersTaon__NS__CLIWRAP($Test, '$Test'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-TEST.js.map