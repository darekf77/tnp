import { BaseCommandLineFeature } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../options';
// @ts-ignore TODO weird inheritance problem
export class BaseCli extends BaseCommandLineFeature {
    async __initialize__() {
        this.params = EnvOptions.from(this.params);
        // await this.__recreateEnvForArtifactAndEnvironment(); // TODO this taks too much time
        // console.log('this.params', this.params);
        // this._tryResolveChildIfInsideArg();
        if (this.params['skipMenu']) {
            this.params = await EnvOptions.releaseSkipMenu(this.params, {
                args: this.allParamsAfterFrameworName.split(' '),
            });
            delete this.params['skipMenu'];
        }
        if (this.params['skipMenuAuto']) {
            this.params = await EnvOptions.releaseSkipMenu(this.params, {
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/base-cli.js.map