"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendCompilation = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../../constants");
//#endregion
class BackendCompilation {
    buildOptions;
    project;
    //#region static
    static counter = 1;
    //#endregion
    //#region fields & getters
    isEnableCompilation = true;
    compilerName = 'Backend Compiler';
    //#endregion
    //#region constructor
    //#region @backend
    constructor(buildOptions, project) {
        this.buildOptions = buildOptions;
        this.project = project;
    }
    //#endregion
    //#endregion
    async runTask() {
        //#region @backendFunc
        const outDistPath = this.project.pathFor(constants_1.distMainProject);
        // Helpers.System.Operations.tryRemoveDir(outDistPath)
        try {
            lib_2.fse.unlinkSync(outDistPath);
        }
        catch (error) { }
        if (!lib_2.fse.existsSync(outDistPath)) {
            lib_2.fse.mkdirpSync(outDistPath);
        }
        await this.libCompilation(this.buildOptions, {
            generateDeclarations: true,
        });
        //#endregion
    }
    //#region methods / lib compilation
    async libCompilation(buildOptions, { generateDeclarations = false, tsExe = 'npm-run tsc', diagnostics = false, }) {
        //#region @backendFunc
        const watch = buildOptions.build.watch;
        if (!this.isEnableCompilation) {
            lib_3.Helpers.log(`Compilation disabled for ${lib_2._.startCase(BackendCompilation.name)}`);
            return;
        }
        const paramasCommon = {
            watch: watch ? ' -w ' : '',
            outDir: ` --outDir ${constants_1.distMainProject + (buildOptions.build.prod ? constants_1.prodSuffix : '')} `,
            noEmitOnError: !watch ? ' --noEmitOnError true ' : '',
            extendedDiagnostics: diagnostics ? ' --extendedDiagnostics ' : '',
            preserveWatchOutput: ` --preserveWatchOutput `,
        };
        //#region cmd
        let prepareCmd = (specificTsconfig) => {
            let commandJs, commandMaps;
            let nocutsrcFolder = this.project.pathFor(constants_1.distNoCutSrcMainProject + (buildOptions.build.prod ? constants_1.prodSuffix : ''));
            const paramsJS = {
                mapRoot: ` --mapRoot ${nocutsrcFolder} `,
                project: `--project ${specificTsconfig}`,
                ...paramasCommon,
            };
            const paramsMaps = { ...paramasCommon };
            paramsMaps.outDir = ` --outDir ${nocutsrcFolder}`;
            paramsMaps.noEmitOnError = !watch ? ' --noEmitOnError false ' : '';
            commandJs = `${tsExe} ${Object.values(paramsJS).join(' ')}  `;
            commandMaps = `${tsExe} ${Object.values(paramsMaps).join(' ')} `;
            return {
                commandJs, // use tsconfig.backend.dist<.prod>.json
                commandMaps, // uses main tsconfig.json to from /src directly everything
                // commandDts
            };
        };
        //#endregion
        const tsconfigBackendPath = (0, lib_2.crossPlatformPath)(this.project.pathFor(buildOptions.build.prod
            ? constants_1.tsconfigBackendDistJson_PROD
            : constants_1.tsconfigBackendDistJson));
        await this.buildStandardLibVer(buildOptions, {
            ...prepareCmd(tsconfigBackendPath),
            generateDeclarations,
        });
        //#endregion
    }
    //#endregion
    //#region methods / build standard lib version
    async buildStandardLibVer(buildOptions, options) {
        //#region @backendFunc
        let { commandJs, commandMaps } = options;
        const taonActionFromParentName = lib_1.GlobalStorage.get(lib_1.taonActionFromParent);
        lib_3.Helpers.getIsVerboseMode() &&
            console.log({
                commandJs,
                commandMaps,
            });
        lib_3.Helpers.info(`

Starting (${buildOptions.build.watch ? 'watch' : 'normal'}) backend TypeScript build....

    `);
        const additionalReplace = (line) => {
            // nothing to replace for now
            if (taonActionFromParentName && line.includes('./src/')) {
                line = line.replace('./src/', `./${taonActionFromParentName}/src/`);
            }
            if (line.includes('../src/lib/')) {
                line = line.replace('../src/lib/', './src/lib/');
            }
            return line;
        };
        await this.project.nodeModules.makeSureInstalled();
        const cwd = this.project.location;
        await lib_3.Helpers.execute(commandJs, cwd, {
            similarProcessKey: 'tsc',
            exitOnErrorCallback: async (code) => {
                //#region handle error
                if (buildOptions.release.releaseType) {
                    throw 'Typescript compilation (backend)';
                }
                else {
                    lib_3.Helpers.error(`[${lib_1.config.frameworkName}] Typescript compilation (backend) error (code=${code})`, false, true);
                }
                //#endregion
            },
            outputLineReplace: (line) => {
                //#region outputs replacement
                if (line.startsWith(`${constants_1.tmpSourceDist + constants_1.prodSuffix}/`)) {
                    return additionalReplace(line.replace(`${constants_1.tmpSourceDist + constants_1.prodSuffix}/`, `./${constants_1.srcMainProject}/`));
                }
                if (line.startsWith(`${constants_1.tmpSourceDist}/`)) {
                    return additionalReplace(line.replace(`${constants_1.tmpSourceDist}/`, `./${constants_1.srcMainProject}/`));
                }
                return additionalReplace(line
                    .replace(`../${constants_1.tmpSourceDist + constants_1.prodSuffix}/`, `./${constants_1.srcMainProject}/`)
                    .replace(`../${constants_1.tmpSourceDist}/`, `./${constants_1.srcMainProject}/`));
                //#endregion
            },
            resolvePromiseMsg: {
                stdout: [constants_1.COMPILATION_COMPLETE_TSC],
            },
            rebuildOnChange: buildOptions.build.watch
                ? this.project.tmpSourceRebuildForBackendObs
                : void 0,
        });
        lib_3.Helpers.logInfo(`* Typescript compilation first part done`);
        await this.project.nodeModules.makeSureInstalled();
        await lib_3.Helpers.execute(commandMaps, cwd, {
            similarProcessKey: 'tsc',
            hideOutput: {
                stderr: true,
                stdout: true,
                acceptAllExitCodeAsSuccess: true,
            },
            resolvePromiseMsg: {
                stdout: ['Watching for file changes.'],
            },
            rebuildOnChange: buildOptions.build.watch
                ? this.project.tmpSourceRebuildForBackendObs
                : void 0,
        });
        // Helpers.writeJson(
        //   [
        //     cwd,
        //     this.buildOptions.build.prod
        //       ? `${distMainProject}${prodSuffix}`
        //       : distMainProject,
        //     libFromCompiledDist,
        //     packageJsonLibDist,
        //   ],
        //   {
        //     name: `${this.project.nameForNpmPackage}/${
        //       libFromCompiledDist + this.buildOptions.build.prod ? prodSuffix : ''
        //     }`,
        //     type: 'module',
        //     exports: {
        //       '.': './index.js',
        //     },
        //   },
        // );
        lib_3.Helpers.logInfo(`* Typescript compilation second part done`);
        lib_3.Helpers.info(`

    Backend TypeScript build done....

        `);
        if (buildOptions.build.watch) {
            // console.log(Helpers.terminalLine());
            lib_3.Helpers.info(`

    ${lib_2.chalk.bold('YOU CAN ATTACH YOUR CODE DEBUGGER NOW')}

    `);
            // console.log(Helpers.terminalLine());
        }
        //#endregion
    }
}
exports.BackendCompilation = BackendCompilation;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/compilations/compilation-backend.js.map