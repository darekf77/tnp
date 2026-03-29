"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Branding = void 0;
const lib_1 = require("tnp-helpers/lib");
const base_cli_1 = require("./base-cli");
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
class $Branding extends base_cli_1.BaseCli {
    async _() {
        lib_1.Helpers.info(`Branding assets...`);
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
exports.$Branding = $Branding;
exports.default = {
    $Branding: lib_1.HelpersTaon.CLIWRAP($Branding, '$Branding'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-BRANDING.js.map