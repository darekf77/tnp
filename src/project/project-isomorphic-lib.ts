import { Project } from "./base-project";
import { BuildOptions } from "../models";
import { ClassHelper, getWebpackEnv } from "../helpers";
// third part
import { buildIsomorphicVersion } from "morphi";
import { BaseProjectLib } from "./base-project-lib";

export class ProjectIsomorphicLib extends BaseProjectLib {


    protected defaultPort: number = 4000;
    runOn(port: number, async = false) {
        if (!port) port = this.defaultPort;
        this.currentPort = port;
        const command = `node dist/run.js -p ${port}`;
        const options = {};
        if (async) {
            this.run(command, options).async()
        } else {
            this.run(command, options).sync()
        }
    }

    projectSpecyficFiles(): string[] {
        return super.projectSpecyficFiles().concat([
            "tsconfig.json",
            "tsconfig.browser.json"
        ]);
    }



    private get additionalParentIsomorphcLibs(): string[] {
        const result: string[] = []
        if (this.parent && Array.isArray(this.parent.requiredLibs)) {
            const includedBaselines = this.parent.requiredLibs
                .filter(d => d.type === 'workspace')

            includedBaselines.forEach(b => {
                // console.log(b.name)
                const baselineIsomorphicLibCHildrens = b.children.filter(f => f.type === 'isomorphic-lib');
                baselineIsomorphicLibCHildrens.forEach(p => {
                    // TODO support for more nested isomorphic libs
                    // console.log('---- ', p.name);
                    result.push(`${b.name}-${p.name}`);
                })
            })
        } else {
            console.log('Project with no parent: ' + this.name)
        }
        // console.log('this.dependencies', this.parent.dependencies)

        // console.log(result)
        // process.exit(0)
        return result;
    }

    private get additionalRequiredIsomorphcLibs() {
        const result: string[] = []
        this.requiredLibs.forEach(d => {
            result.push(d.name);
        })
        // console.log(result)
        // process.exit(0)
        return result;
    }

    private getIsomorphcLibNames(parentWorksapce = false) {
        let result = [];
        result = result.concat(this.additionalRequiredIsomorphcLibs);
        if (parentWorksapce) {
            result = result.concat(this.additionalParentIsomorphcLibs)
        }
        // console.log('result', result)
        // process.exit(0)
        return result;
    }

    buildSteps(buildOptions?: BuildOptions) {
        const { prod, watch, outDir } = buildOptions;
        this.buildLib(outDir, prod, watch);
        return;
    }

    buildLib(outDir: "dist" | "bundle", prod = false, watch = false) {
        const isParentIsWorksapce = (this.parent && this.parent.type === 'workspace')
        const isomorphicNames = this.getIsomorphcLibNames(isParentIsWorksapce)
        const webpackParams = BuildOptions.stringify(prod, watch, outDir, isomorphicNames);
        if (watch) {
            const functionName = ClassHelper.getMethodName(
                ProjectIsomorphicLib.prototype,
                ProjectIsomorphicLib.prototype.BUILD_ISOMORPHIC_LIB_WEBPACK)

            this.watcher.call(functionName, webpackParams);
        } else {
            this.BUILD_ISOMORPHIC_LIB_WEBPACK(webpackParams);
        }
    }

    BUILD_ISOMORPHIC_LIB_WEBPACK(params: string) {
        this.compilationWrapper(() => {
            const env = getWebpackEnv(params);
            buildIsomorphicVersion({
                foldersPathes: {
                    dist: env.outDir
                },
                toolsPathes: {
                    tsc: 'tnp tsc',
                    cpr: 'tnp cpr',
                    rimraf: 'tnp rimraf',
                    mkdirp: 'tnp mkdirp',
                    ln: 'tnp ln'
                },
                build: {
                    otherIsomorphicLibs: env.additionalIsomorphicLibs
                }
            });
        }, `isomorphic-lib (project ${this.name})`)
    }

}