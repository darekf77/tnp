//#region imports
import { config, GlobalStorage, taonActionFromParent } from 'tnp-core/lib-prod';
import { crossPlatformPath, fse, chalk, ___NS__startCase } from 'tnp-core/lib-prod';
import { Helpers__NS__error, Helpers__NS__execute, Helpers__NS__getIsVerboseMode, Helpers__NS__info, Helpers__NS__log, Helpers__NS__logInfo } from 'tnp-helpers/lib-prod';
import { COMPILATION_COMPLETE_TSC, distMainProject, distNoCutSrcMainProject, prodSuffix, srcMainProject, tmpSourceDist, tsconfigBackendDistJson, tsconfigBackendDistJson_PROD, } from '../../../../../../../constants';
//#endregion
export class BackendCompilation {
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
        const outDistPath = this.project.pathFor(distMainProject);
        // Helpers.System.Operations.tryRemoveDir(outDistPath)
        try {
            fse.unlinkSync(outDistPath);
        }
        catch (error) { }
        if (!fse.existsSync(outDistPath)) {
            fse.mkdirpSync(outDistPath);
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
            Helpers__NS__log(`Compilation disabled for ${___NS__startCase(BackendCompilation.name)}`);
            return;
        }
        const paramasCommon = {
            watch: watch ? ' -w ' : '',
            outDir: ` --outDir ${distMainProject + (buildOptions.build.prod ? prodSuffix : '')} `,
            noEmitOnError: !watch ? ' --noEmitOnError true ' : '',
            extendedDiagnostics: diagnostics ? ' --extendedDiagnostics ' : '',
            preserveWatchOutput: ` --preserveWatchOutput `,
        };
        //#region cmd
        let prepareCmd = (specificTsconfig) => {
            let commandJs, commandMaps;
            let nocutsrcFolder = this.project.pathFor(distNoCutSrcMainProject + (buildOptions.build.prod ? prodSuffix : ''));
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
        const tsconfigBackendPath = crossPlatformPath(this.project.pathFor(buildOptions.build.prod
            ? tsconfigBackendDistJson_PROD
            : tsconfigBackendDistJson));
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
        const taonActionFromParentName = GlobalStorage.get(taonActionFromParent);
        Helpers__NS__getIsVerboseMode() &&
            console.log({
                commandJs,
                commandMaps,
            });
        Helpers__NS__info(`

Starting (${buildOptions.build.watch ? 'watch' : 'normal'}) backend TypeScript build....

    `);
        const additionalReplace = (line) => {
            // nothing to replace for now
            if (taonActionFromParentName && line.includes('./src/')) {
                line = line.replace('./src/', `./${taonActionFromParentName}/src/`);
            }
            return line;
        };
        await this.project.nodeModules.makeSureInstalled();
        const cwd = this.project.location;
        await Helpers__NS__execute(commandJs, cwd, {
            similarProcessKey: 'tsc',
            exitOnErrorCallback: async (code) => {
                //#region handle error
                if (buildOptions.release.releaseType) {
                    throw 'Typescript compilation (backend)';
                }
                else {
                    Helpers__NS__error(`[${config.frameworkName}] Typescript compilation (backend) error (code=${code})`, false, true);
                }
                //#endregion
            },
            outputLineReplace: (line) => {
                //#region outputs replacement
                if (line.startsWith(`${tmpSourceDist + prodSuffix}/`)) {
                    return additionalReplace(line.replace(`${tmpSourceDist + prodSuffix}/`, `./${srcMainProject}/`));
                }
                if (line.startsWith(`${tmpSourceDist}/`)) {
                    return additionalReplace(line.replace(`${tmpSourceDist}/`, `./${srcMainProject}/`));
                }
                return additionalReplace(line
                    .replace(`../${tmpSourceDist + prodSuffix}/`, `./${srcMainProject}/`)
                    .replace(`../${tmpSourceDist}/`, `./${srcMainProject}/`));
                //#endregion
            },
            resolvePromiseMsg: {
                stdout: [COMPILATION_COMPLETE_TSC],
            },
            rebuildOnChange: buildOptions.build.watch
                ? this.project.tmpSourceRebuildForBackendObs
                : void 0,
        });
        Helpers__NS__logInfo(`* Typescript compilation first part done`);
        await this.project.nodeModules.makeSureInstalled();
        await Helpers__NS__execute(commandMaps, cwd, {
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
        // Helpers__NS__writeJson(
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
        Helpers__NS__logInfo(`* Typescript compilation second part done`);
        Helpers__NS__info(`

    Backend TypeScript build done....

        `);
        if (buildOptions.build.watch) {
            // console.log(Helpers.terminalLine());
            Helpers__NS__info(`

    ${chalk.bold('YOU CAN ATTACH YOUR CODE DEBUGGER NOW')}

    `);
            // console.log(Helpers.terminalLine());
        }
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/compilations/compilation-backend.js.map