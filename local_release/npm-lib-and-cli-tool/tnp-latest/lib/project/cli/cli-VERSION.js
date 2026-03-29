"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Version = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const project_1 = require("../abstract/project"); // TODO QUICK FIX for version
const base_cli_1 = require("./base-cli");
// @ts-ignore TODO weird inheritance problem
class $Version extends base_cli_1.BaseCli {
    //#region _
    async _() {
        // Helpers.log(`Framework name: '${config.frameworkName}'`);
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        // globalSpinner.instance.stop();
        // globalSpinner.instance.stop();
        // Helpers.info('spinner stopped, waiting 2 second');
        // await Utils.wait(5);
        // Helpers.info('spinner started again, waiting 2 second');
        // globalSpinner.instance.start();
        // await Utils.wait(5);
        // globalSpinner.instance.succeed('niger!');
        // globalSpinner.instance.stop();
        // a(1);
        // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // await Utils.wait(1);
        // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // await Utils.wait(1);
        // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // await Utils.wait(1);
        // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // await Utils.wait(1);
        // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // Helpers.info('waiting...');
        // global.spinner?.start();
        // Helpers.info('waiting next time!!. ..');
        // log.data('Hellleoeoeo')
        // TODO QUICK FIX
        const tnpProj = project_1.Project.ins.Tnp;
        //
        const taonProj = project_1.Project.ins.From([
            lib_2.fse.realpathSync(lib_2.path.dirname(tnpProj.location)),
            lib_1.taonPackageName,
        ]);
        lib_3.Helpers.success(`

  Taon: ${taonProj?.packageJson.version ? `v${taonProj.packageJson.version}` : '-'}
  Tnp: ${tnpProj?.packageJson.version ? `v${tnpProj.packageJson.version}` : '-'}

    `);
        // await Utils.wait(5);
        this._exit();
    }
    //#endregion
    async path() {
        console.log(`

    next path
    ${this.project.packageJson.resolvePossibleNewVersion('patch')}

    `);
        this._exit();
    }
}
exports.$Version = $Version;
exports.default = {
    $Version: lib_3.HelpersTaon.CLIWRAP($Version, '$Version'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-VERSION.js.map