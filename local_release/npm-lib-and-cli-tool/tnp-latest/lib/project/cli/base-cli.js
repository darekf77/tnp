"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCli = void 0;
const lib_1 = require("tnp-helpers/lib");
const options_1 = require("../../options");
// @ts-ignore TODO weird inheritance problem
class BaseCli extends lib_1.BaseCommandLineFeature {
    async __initialize__() {
        this.params = options_1.EnvOptions.from(this.params);
        // await this.__recreateEnvForArtifactAndEnvironment(); // TODO this taks too much time
        // console.log('this.params', this.params);
        // this._tryResolveChildIfInsideArg();
        if (this.params['skipMenu']) {
            this.params = await options_1.EnvOptions.releaseSkipMenu(this.params, {
                args: this.allParamsAfterFrameworName.split(' '),
            });
            delete this.params['skipMenu'];
        }
        if (this.params['skipMenuAuto']) {
            this.params = await options_1.EnvOptions.releaseSkipMenu(this.params, {
                selectDefaultValues: true,
                args: this.allParamsAfterFrameworName.split(' '),
            });
            delete this.params['skipMenuAuto'];
        }
    }
    async __recreateEnvForArtifactAndEnvironment() {
        // this.params = this.project // I am recreating only basic things
        //   ? await this.project.environmentConfig.update(this.params)
        //   : this.params;
    }
    _() { }
}
exports.BaseCli = BaseCli;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/base-cli.js.map