"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const options_1 = require("../../options");
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Build extends base_cli_1.BaseCli {
    //#region initialize
    async __initialize__() {
        await super.__initialize__();
        if (this.params.build['base-href'] && !this.params.build.baseHref) {
            this.params.build.baseHref = this.params.build['base-href'];
            delete this.params.build['base-href'];
        }
    }
    //#endregion
    //#region  _
    async _(recursiveAction = false) {
        await this.project.build(this.params.clone({
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
            },
            recursiveAction,
            finishCallback: () => this._exit(),
        }));
    }
    //#endregion
    async all() {
        await this._(true);
    }
    //#region watch build interactive mode
    /**
     * display console menu
     */
    async watch() {
        await this.project.build(this.params.clone({
            build: {
                watch: true,
            },
        }));
    }
    //#endregion
    //#region other build commands
    //#region other build commands / watch build library
    async watchLib() {
        await this.project.build(this.params.clone({
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
            },
            build: {
                watch: true,
            },
            finishCallback: () => this._exit(),
        }));
    }
    //#endregion
    //#region other build commands / build library
    async lib() {
        await this._lib();
    }
    async libProd() {
        await this._lib(true);
    }
    async _lib(prod = false) {
        await this.project.build(options_1.EnvOptions.from({
            ...this.params,
            build: {
                prod,
            },
            release: {
                ...this.params.release,
                targetArtifact: options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
            },
            recursiveAction: this.project.framework.isContainer,
            finishCallback: () => this._exit(),
        }));
    }
    //#endregion
    //#region other build commands / watch build vscode
    async watchVscode() {
        await this.vscode(true);
    }
    //#endregion
    //#region other build commands / build vscode
    async vscode(watch = false) {
        await this.project.build(options_1.EnvOptions.from({
            ...this.params,
            build: {
                watch,
            },
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.VSCODE_PLUGIN,
            },
            finishCallback: () => this._exit(),
        }));
    }
    //#endregion
    //#region other build commands / watch build websql app
    async watchAppWebsql() {
        await this.project.build(this.params.clone({
            build: {
                watch: true,
                websql: true,
            },
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
            },
            finishCallback: () => this._exit(),
        }));
    }
    //#endregion
    //#region other build commands / watch build normal app
    async watchApp(websql = false) {
        await this.project.build(this.params.clone({
            build: {
                watch: true,
            },
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
            },
            finishCallback: () => this._exit(),
        }));
    }
    //#endregion
    //#region other build commands / watch build electron websql app
    async watchElectronWebsql() {
        await this.watchElectron(true);
    }
    //#endregion
    //#region other build commands / watch build electron normal app
    async watchElectron(websql = false) {
        await this.project.build(this.params.clone({
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.ELECTRON_APP,
            },
            build: {
                websql,
                watch: true,
            },
            finishCallback: () => this._exit(),
        }));
    }
    /**
     * JUST FOR TESTING PURPOSES
     */
    async electron(websql = false) {
        // await this.project.release(
        //   this.params.clone({
        //     release: {
        //       skipNpmPublish: true,
        //       skipCodeCutting: true,
        //       skipTagGitPush: true,
        //       skipResolvingGitChanges: true,
        //       targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
        //       releaseType: 'local',
        //       envName: '__',
        //     },
        //     build: {
        //       websql,
        //       watch: false,
        //     },
        //     finishCallback: () => this._exit(),
        //   }),
        // );
        // await this.project.artifactsManager.artifact.npmLibAndCliTool.buildPartial(
        //   this.params.clone({
        //     build: {
        //       pwa: {
        //         disableServiceWorker: true,
        //       },
        //       baseHref: `./`,
        //     },
        //     copyToManager: {
        //       skip: true,
        //     },
        //     release: {
        //       targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
        //     },
        //   }),
        // );
        // await this.project.build(
        //   this.params.clone({
        //     release: {
        //       targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
        //       releaseType: 'local',
        //     },
        //     build: {
        //       websql,
        //       watch: false,
        //     },
        //     finishCallback: () => this._exit(),
        //   }),
        // );
        // this._exit();
    }
    //#endregion
    //#region other build commands / clean watch/build
    async cleanWatchLib() {
        await this.project.clear();
        await this.watchLib();
    }
    async _clearBuild() {
        await this.project.clear();
        if (this.project.framework.isContainer) {
            for (const child of this.project.children) {
                if (!child.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
                    await child.clear();
                }
            }
        }
        await this.lib();
    }
    async cleanLib() {
        await this._clearBuild();
    }
    async cleanBuild() {
        await this._clearBuild();
    }
    //#endregion
    //#region other build commands / default build for project
    async default() {
        await this.project.build(
        // TODO ADD ARTIFACT ?
        options_1.EnvOptions.from({
            ...this.params,
            build: {
                watch: true,
            },
        }));
    }
    //#endregion
    //#region other build commands / build angular app
    /**
     * @deprecated
     */
    async releaseApp() {
        // await this.project.build(
        //   this.params.clone({
        //     build: {
        //       watch: false,
        //     },
        //     release: {
        //       targetArtifact: 'npm-lib-and-cli-tool',
        //     },
        //   }),
        // );
        await this.project.release(this.params.clone({
            copyToManager: {
                skip: true,
            },
            release: {
                skipNpmPublish: true,
                skipTagGitPush: true,
                skipReleaseQuestion: true,
                targetArtifact: options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
                releaseType: options_1.ReleaseType.MANUAL,
            },
            build: {
                watch: false,
                // angularSsr: true,
            },
        }));
        this._exit();
    }
    /**
     * @deprecated
     */
    async appWatch() {
        await this.project.build(this.params.clone({
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
            },
            build: {
                watch: true,
            },
        }));
    }
    //#endregion
    //#region other build commands / start lib/app build
    async start() {
        // TODO add proper logic
        await this.project.build(this.params.clone({
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
            },
            build: {
                watch: true,
            },
        }));
        await this.project.build(this.params.clone({
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
            },
            build: {
                watch: true,
            },
        }));
    }
    async startElectron() {
        // TODO add proper logic
        await this.project.build(this.params.clone({
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
            },
            build: {
                watch: true,
            },
        }));
        await this.project.build(this.params.clone({
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.ELECTRON_APP,
            },
            build: {
                watch: true,
            },
        }));
    }
    async cleanStartElectron() {
        await this.project.clear(this.params);
        await this.startElectron();
    }
    /**
     * @deprecated
     */
    async startClean() {
        await this.project.clear(this.params);
        await this.start();
    }
    //#endregion
    //#region other build commands / mk docs build
    /**
     * @deprecated
     */
    async mkdocs() {
        const mkdocsActions = {
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            /* */
            SERVE_DOCS_TAON: {
                name: 'Serve docs for www.taon.dev on 8000',
                value: {
                    command: 'python -m mkdocs serve',
                    action: void 0,
                },
            },
        };
        let res;
        while (true) {
            lib_2.Helpers.clearConsole();
            const q = await lib_1.UtilsTerminal.select({
                choices: mkdocsActions,
                question: 'What you wanna do with docs ?',
            });
            if (q.command) {
                res = q;
                break;
            }
        }
        this.project.run(res.command, { output: true }).sync();
        if (lib_1._.isFunction(res.action)) {
            await res.action();
        }
        lib_2.Helpers.info('DONE BUILDING DOCS');
        this._exit();
    }
}
exports.default = {
    $Build: lib_2.HelpersTaon.CLIWRAP($Build, '$Build'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-BUILD.js.map