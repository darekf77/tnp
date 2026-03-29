import { path } from 'tnp-core/lib-prod';
import { Helpers__NS__log } from 'tnp-helpers/lib-prod';
import { srcMainProject } from '../../../../../../../constants';
import { ProductionBuild } from '../../../../../../../project/abstract/artifacts/__helpers__/production-build';
import { BackendCompilation } from './compilation-backend';
import { BrowserCompilation } from './compilation-browser';
//#endregion
export class IncrementalBuildProcess {
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
        Helpers__NS__log(`[incremental-build-process] for project: ${project.genericName}`);
        //#region init variables
        Helpers__NS__log(`[incremental-build-process]  this.project.grandpa: ${this.project.grandpa?.genericName} `);
        Helpers__NS__log(`[incremental-build-process]  this.project.parent: ${this.project.parent?.genericName} `);
        Helpers__NS__log(`[incremental-build-process] parentProj: ${project?.parent?.genericName} `);
        //#endregion
        //#region int backend compilation
        this.backendCompilation = new BackendCompilation(buildOptions, project);
        Helpers__NS__log(`[incremental-build-process] this.backendCompilation exists: ${!!this.backendCompilation}`);
        if (buildOptions.build.genOnlyClientCode) {
            if (this.backendCompilation) {
                this.backendCompilation.isEnableCompilation = false;
            }
        }
        //#endregion
        if (project.framework.isStandaloneProject) {
            this.browserCompilationStandalone = new BrowserCompilation(project, srcMainProject, buildOptions);
            this.productionBuild = new ProductionBuild(project);
        }
    }
    //#endregion
    //#endregion
    //#region  methods / browser task anme
    browserTaksName(taskName, bc) {
        //#region @backendFunc
        return `browser ${taskName} in ${path.basename(this.project.location)}`;
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/compilations/incremental-build-process.js.map