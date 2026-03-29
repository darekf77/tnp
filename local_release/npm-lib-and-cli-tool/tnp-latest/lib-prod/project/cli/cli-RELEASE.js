import { UtilsTerminal__NS__confirm, UtilsTerminal__NS__select } from 'tnp-core/lib-prod';
import { HelpersTaon__NS__CLIWRAP } from 'tnp-helpers/lib-prod';
import { ReleaseArtifactTaon, ReleaseType, ReleaseArtifactTaonNamesArr, } from '../../options';
import { BaseCli } from './base-cli';
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Release extends BaseCli {
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
        await this._releaseProcess(this.params, ReleaseType.LOCAL);
    }
    async localNpm() {
        await this._releaseProcess(this.params, ReleaseType.LOCAL, ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);
    }
    async localVscode() {
        await this._releaseProcess(this.params, ReleaseType.LOCAL, ReleaseArtifactTaon.VSCODE_PLUGIN);
    }
    async localElectron() {
        await this._releaseProcess(this.params, ReleaseType.LOCAL, ReleaseArtifactTaon.ELECTRON_APP);
    }
    //#endregion
    //#region cloud
    async cloud() {
        await this._releaseProcess(this.params, ReleaseType.CLOUD);
    }
    //#endregion
    //#region manual
    async manual() {
        await this._releaseProcess(this.params, ReleaseType.MANUAL);
    }
    //#endregion
    //#region static pages
    async staticPages() {
        await this._releaseProcess(this.params, ReleaseType.STATIC_PAGES);
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
                releaseType: ReleaseType.MANUAL,
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
                releaseType: ReleaseType.MANUAL,
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
                releaseType: ReleaseType.MANUAL,
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
                releaseType: ReleaseType.MANUAL,
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
                releaseType: ReleaseType.MANUAL,
            },
        }));
        this._exit();
    }
    //#endregion
    //#endregion
    //#region install locally
    async installLocallyVscodePlugin() {
        await this._installLocally(true, {
            targetArtifact: ReleaseArtifactTaon.VSCODE_PLUGIN,
        });
        this._exit();
    }
    async installLocallyVscodePluginProd() {
        await this._installLocally(false, {
            targetArtifact: ReleaseArtifactTaon.VSCODE_PLUGIN,
        }, true);
        this._exit();
    }
    async installLocallyCliTool() {
        await this._installLocally(true, {
            targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        });
        this._exit();
    }
    async installLocallyCliToolProd() {
        await this._installLocally(false, {
            targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
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
                skipTagGitPush: true,
                skipResolvingGitChanges: true,
                targetArtifact: releaseOpt.targetArtifact,
                removeReleaseOutputAfterLocalInstall: releaseOpt.removeReleaseOutputAfterLocalInstall,
                releaseType: ReleaseType.LOCAL,
                releaseVersionBumpType: 'patch',
                installLocally: true,
                skipReleaseQuestion: skipLibBuild,
                skipBuildingArtifacts: skipLibBuild
                    ? [ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL]
                    : [],
            },
        }));
    }
    async installLocally() {
        //#region @backendFunc
        const allowedArtifacts = [
            ReleaseArtifactTaon.VSCODE_PLUGIN,
            ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        ];
        const options = {
            ['_']: {
                name: '< Select artifact to build/install locally >',
            },
            ...ReleaseArtifactTaonNamesArr.reverse().reduce((a, b) => {
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
            option = await UtilsTerminal__NS__select({
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
            skipLibBuild = await UtilsTerminal__NS__confirm({
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
export default {
    $Release: HelpersTaon__NS__CLIWRAP($Release, '$Release'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-RELEASE.js.map