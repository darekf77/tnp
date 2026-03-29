"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const options_1 = require("../../options");
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Release extends base_cli_1.BaseCli {
    async __initialize__() {
        await super.__initialize__();
        if (this.project.framework.isStandaloneProject) {
            await this.project.nodeModules.makeSureInstalled();
        }
    }
    //#region _
    async _() {
        await this.project.releaseProcess.displayReleaseProcessMenu(this.params);
        // await this.patch();
        this._exit();
    }
    //#endregion
    //#region release process
    async _releaseProcess(envOptions, releaseType, artifact) {
        await this.project.releaseProcess.releaseByType(releaseType, envOptions);
        this._exit();
    }
    //#endregion
    //#region local
    async local() {
        await this._releaseProcess(this.params, options_1.ReleaseType.LOCAL);
    }
    async localNpm() {
        await this._releaseProcess(this.params, options_1.ReleaseType.LOCAL, options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);
    }
    async localVscode() {
        await this._releaseProcess(this.params, options_1.ReleaseType.LOCAL, options_1.ReleaseArtifactTaon.VSCODE_PLUGIN);
    }
    async localElectron() {
        await this._releaseProcess(this.params, options_1.ReleaseType.LOCAL, options_1.ReleaseArtifactTaon.ELECTRON_APP);
    }
    //#endregion
    //#region cloud
    async cloud() {
        await this._releaseProcess(this.params, options_1.ReleaseType.CLOUD);
    }
    //#endregion
    //#region manual
    async manual() {
        await this._releaseProcess(this.params, options_1.ReleaseType.MANUAL);
    }
    //#endregion
    //#region static pages
    async staticPages() {
        await this._releaseProcess(this.params, options_1.ReleaseType.STATIC_PAGES);
    }
    //#endregion
    //#region auto release
    //#region auto release / auto
    async auto() {
        await this.project.release(this.params.clone({
            release: {
                autoReleaseUsingConfig: true,
                autoReleaseTaskName: this.firstArg,
                releaseVersionBumpType: 'patch',
                releaseType: options_1.ReleaseType.MANUAL,
            },
        }));
        this._exit();
    }
    //#endregion
    //#region auto release / auto clear
    async autoClear() {
        await this.project.clear();
        await this.project.release(this.params.clone({
            release: {
                autoReleaseUsingConfig: true,
                autoReleaseTaskName: this.firstArg,
                releaseVersionBumpType: 'patch',
                releaseType: options_1.ReleaseType.MANUAL,
            },
        }));
        this._exit();
    }
    //#endregion
    //#region auto release / major
    async major() {
        await this.project.release(this.params.clone({
            release: {
                autoReleaseUsingConfig: true,
                autoReleaseTaskName: this.firstArg,
                releaseVersionBumpType: 'major',
                releaseType: options_1.ReleaseType.MANUAL,
            },
        }));
        this._exit();
    }
    //#endregion
    //#region auto release / minor
    async minor() {
        await this.project.release(this.params.clone({
            release: {
                autoReleaseUsingConfig: true,
                autoReleaseTaskName: this.firstArg,
                releaseVersionBumpType: 'minor',
                releaseType: options_1.ReleaseType.MANUAL,
            },
        }));
        this._exit();
    }
    //#endregion
    //#region auto release / patch
    async patch() {
        await this.project.release(this.params.clone({
            release: {
                autoReleaseUsingConfig: true,
                autoReleaseTaskName: this.firstArg,
                releaseVersionBumpType: 'patch',
                releaseType: options_1.ReleaseType.MANUAL,
            },
        }));
        this._exit();
    }
    //#endregion
    //#endregion
    //#region install locally
    async installLocallyVscodePlugin() {
        await this._installLocally(true, {
            targetArtifact: options_1.ReleaseArtifactTaon.VSCODE_PLUGIN,
        });
        this._exit();
    }
    async installLocallyVscodePluginProd() {
        await this._installLocally(false, {
            targetArtifact: options_1.ReleaseArtifactTaon.VSCODE_PLUGIN,
        }, true);
        this._exit();
    }
    async installLocallyCliTool() {
        await this._installLocally(true, {
            targetArtifact: options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        });
        this._exit();
    }
    async installLocallyCliToolProd() {
        await this._installLocally(false, {
            targetArtifact: options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        }, true);
        this._exit();
    }
    async _installLocally(skipLibBuild, releaseOpt, prod) {
        await this.project.release(this.params.clone({
            build: {
                watch: false,
                prod,
            },
            release: {
                envName: releaseOpt.envName,
                envNumber: releaseOpt.envNumber,
                // skipTagGitPush: true,
                pushToAllOriginsWhenLocalReleaseBranch: true,
                skipResolvingGitChanges: true,
                targetArtifact: releaseOpt.targetArtifact,
                removeReleaseOutputAfterLocalInstall: releaseOpt.removeReleaseOutputAfterLocalInstall,
                releaseType: options_1.ReleaseType.LOCAL,
                releaseVersionBumpType: 'patch',
                installLocally: true,
                askUserBeforeFinalAction: false,
                skipReleaseQuestion: skipLibBuild,
                skipBuildingArtifacts: skipLibBuild
                    ? [options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL]
                    : [],
            },
        }));
    }
    async installLocally() {
        //#region @backendFunc
        const allowedArtifacts = [
            options_1.ReleaseArtifactTaon.VSCODE_PLUGIN,
            options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        ];
        const options = {
            ['_']: {
                name: '< Select artifact to build/install locally >',
            },
            ...options_1.ReleaseArtifactTaonNamesArr.reverse().reduce((a, b) => {
                return {
                    ...a,
                    ...{
                        [b]: {
                            disabled: !allowedArtifacts.includes(b),
                            name: b,
                        },
                    },
                };
            }, {}),
        };
        let option;
        while (true) {
            option = await lib_1.UtilsTerminal.select({
                choices: options,
                question: 'What you wanna build/install locally ?',
            });
            if (option && option !== '_') {
                // console.log({ option });
                break;
            }
        }
        let skipLibBuild = false;
        if (option !== 'npm-lib-and-cli-tool') {
            skipLibBuild = await lib_1.UtilsTerminal.confirm({
                message: 'Skip library build ?',
                defaultValue: true,
            });
        }
        if (option === 'vscode-plugin') {
            await this._installLocally(skipLibBuild, {
                targetArtifact: option,
            });
        }
        if (option === 'npm-lib-and-cli-tool') {
            skipLibBuild = true;
            await this._installLocally(skipLibBuild, {
                targetArtifact: option,
            });
        }
        this._exit();
        //#endregion
    }
}
exports.default = {
    $Release: lib_2.HelpersTaon.CLIWRAP($Release, '$Release'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-RELEASE.js.map