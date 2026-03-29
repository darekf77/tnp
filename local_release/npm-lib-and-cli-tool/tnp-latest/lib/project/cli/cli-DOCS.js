"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const options_1 = require("../../options");
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Docs extends base_cli_1.BaseCli {
    //#region _
    async _() {
        //#region @backendFunc
        await this.project.build(this.params.clone({
            build: {
                watch: false,
            },
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
            },
            finishCallback: () => this._exit(),
        }));
        this._exit(0);
        //#endregion
    }
    //#endregion
    //#region watch
    async watch() {
        //#region @backendFunc
        await this.project.build(this.params.clone({
            build: {
                watch: true,
            },
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
            },
            finishCallback: () => this._exit(),
        }));
        //#endregion
    }
    //#endregion
    async serve() {
        //#region @backendFunc
        const port = await this.project.registerAndAssignPort('serving static docs', {
            startFrom: 8000,
        });
        const buildedDocsFolder = this.project.artifactsManager.artifact.docsWebapp.docs
            .outDocsDistFolderAbs;
        await lib_2.UtilsHttp.startHttpServer(buildedDocsFolder, port, {
            startMessage: `

        Serving static docs pages on http://localhost:${port}
        From folder:
        ${buildedDocsFolder}

        Press Ctrl+C to stop the server.

        `,
        });
        //#endregion
    }
    async envCheck(options) {
        //#region @backendFunc
        const envOK = await this.project.artifactsManager.artifact.docsWebapp.docs.validateEnvironemntForMkdocsBuild();
        console.log(`Environment for DOCS build is ${envOK ? lib_1.chalk.green('OK') : lib_1.chalk.red('NOT OK')}`);
        this._exit();
        //#endregion
    }
}
exports.default = {
    $Docs: lib_2.HelpersTaon.CLIWRAP($Docs, '$Docs'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-DOCS.js.map