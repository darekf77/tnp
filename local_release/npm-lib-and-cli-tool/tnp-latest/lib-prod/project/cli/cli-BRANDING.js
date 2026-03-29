import { Helpers__NS__info, HelpersTaon__NS__CLIWRAP } from 'tnp-helpers/lib-prod';
import { BaseCli } from './base-cli';
/**
 # Branding of assets
- from logo.svg or logo.png
  + create icon
  + create favicons
  + create splashscreens
  + create logos inside apps

# Branding of existed modules/projects
  - rename to create similar module or project:
    + files
    + folders
    + files contents

 */ // @ts-ignore TODO weird inheritance problem
export class $Branding extends BaseCli {
    async _() {
        Helpers__NS__info(`Branding assets...`);
        await this.project.artifactsManager.globalHelper.branding.apply(true);
        this._exit();
    }
    //#region create vscode icons
    async logoVscode() {
        //#region @backendFunc
        await this.project.artifactsManager.globalHelper.branding.generateLogoFroVscodeLocations();
        this._exit();
        //#endregion
    }
}
export default {
    $Branding: HelpersTaon__NS__CLIWRAP($Branding, '$Branding'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-BRANDING.js.map