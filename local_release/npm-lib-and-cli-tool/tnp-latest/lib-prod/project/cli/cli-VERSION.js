import { taonPackageName } from 'tnp-core/lib-prod';
import { fse, path } from 'tnp-core/lib-prod';
import { Helpers__NS__success, HelpersTaon__NS__CLIWRAP } from 'tnp-helpers/lib-prod';
import { Project } from '../abstract/project'; // TODO QUICK FIX for version
import { BaseCli } from './base-cli';
// @ts-ignore TODO weird inheritance problem
export class $Version extends BaseCli {
    //#region _
    async _() {
        // Helpers__NS__log(`Framework name: '${config.frameworkName}'`);
        /* */
        /* */
        /* */
        /* */
        /* */
        /* */
        // globalSpinner.instance.stop();
        // globalSpinner.instance.stop();
        // Helpers__NS__info('spinner stopped, waiting 2 second');
        // await Utils__NS__wait(5);
        // Helpers__NS__info('spinner started again, waiting 2 second');
        // globalSpinner.instance.start();
        // await Utils__NS__wait(5);
        // globalSpinner.instance.succeed('niger!');
        // globalSpinner.instance.stop();
        // a(1);
        // Helpers__NS__info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // await Utils__NS__wait(1);
        // Helpers__NS__info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // await Utils__NS__wait(1);
        // Helpers__NS__info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // await Utils__NS__wait(1);
        // Helpers__NS__info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // await Utils__NS__wait(1);
        // Helpers__NS__info(`${config.frameworkName} location: ${ this.Tnp.location}`)
        // Helpers__NS__info('waiting...');
        // global.spinner?.start();
        // Helpers__NS__info('waiting next time!!. ..');
        // log.data('Hellleoeoeo')
        // TODO QUICK FIX
        const tnpProj = Project.ins.Tnp;
        //
        const taonProj = Project.ins.From([
            fse.realpathSync(path.dirname(tnpProj.location)),
            taonPackageName,
        ]);
        Helpers__NS__success(`

  Taon: ${taonProj?.packageJson.version ? `v${taonProj.packageJson.version}` : '-'}
  Tnp: ${tnpProj?.packageJson.version ? `v${tnpProj.packageJson.version}` : '-'}

    `);
        // await Utils__NS__wait(5);
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
export default {
    $Version: HelpersTaon__NS__CLIWRAP($Version, '$Version'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-VERSION.js.map