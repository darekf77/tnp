"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncrementalBuildProcess = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../../constants");
const production_build_1 = require("../../../../../../../project/abstract/artifacts/__helpers__/production-build");
const compilation_backend_1 = require("./compilation-backend");
const compilation_browser_1 = require("./compilation-browser");
//#endregion
class IncrementalBuildProcess {
    project;
    buildOptions;
    //#region fields & getters
    backendCompilation;
    browserCompilationStandalone;
    productionBuild;
    //#region constructor
    //#region @backend
    constructor(project, buildOptions) {
        this.project = project;
        this.buildOptions = buildOptions;
        lib_2.Helpers.log(`[incremental-build-process] for project: ${project.genericName}`);
        //#region init variables
        lib_2.Helpers.log(`[incremental-build-process]  this.project.grandpa: ${this.project.grandpa?.genericName} `);
        lib_2.Helpers.log(`[incremental-build-process]  this.project.parent: ${this.project.parent?.genericName} `);
        lib_2.Helpers.log(`[incremental-build-process] parentProj: ${project?.parent?.genericName} `);
        //#endregion
        //#region int backend compilation
        this.backendCompilation = new compilation_backend_1.BackendCompilation(buildOptions, project);
        lib_2.Helpers.log(`[incremental-build-process] this.backendCompilation exists: ${!!this.backendCompilation}`);
        if (buildOptions.build.genOnlyClientCode) {
            if (this.backendCompilation) {
                this.backendCompilation.isEnableCompilation = false;
            }
        }
        //#endregion
        if (project.framework.isStandaloneProject) {
            this.browserCompilationStandalone = new compilation_browser_1.BrowserCompilation(project, constants_1.srcMainProject, buildOptions);
            this.productionBuild = new production_build_1.ProductionBuild(project);
        }
    }
    //#endregion
    //#endregion
    //#region  methods / browser task anme
    browserTaksName(taskName, bc) {
        //#region @backendFunc
        return `browser ${taskName} in ${lib_1.path.basename(this.project.location)}`;
        //#endregion
    }
    //#endregion
    //#region  methods / run task
    async runTask(options) {
        //#region @backendFunc
        const { taskName, watch } = options;
        if (!this.project.framework.isStandaloneProject) {
            return;
        }
        // this creates: tmp-src-dist, tmp-src-app-dist , tmp-source-dist
        // tmp-src-dist-websql, tmp-src-app-dist-websql , tmp-source-dist
        await this.browserCompilationStandalone.runTask({
            taskName: this.browserTaksName(taskName, this.browserCompilationStandalone),
            watch,
        });
        // produciton build prepares:
        // tmp-src-dist-prod, tmp-src-dist-websql-prod, tmp-source-dist-prod
        if (!watch) {
            this.productionBuild.runTask(this.buildOptions);
        }
        // compilation of  tmp-source-dist or tmp-source-dist-prod
        if (this.backendCompilation) {
            await this.backendCompilation.runTask();
        }
        // copy manager moves produciton stuff from dist-prod to dist
        //#endregion
    }
}
exports.IncrementalBuildProcess = IncrementalBuildProcess;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/compilations/incremental-build-process.js.map