"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackagesRecognition = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
//#endregion
/**
 * TODO refactor this - use immutable db
 */
// @ts-ignore TODO weird inheritance problem
class PackagesRecognition extends lib_3.BaseFeatureForProject {
    //#region constructor
    get coreContainer() {
        return this.project.framework.coreContainer;
    }
    inMemoryIsomorphicLibs = [];
    //#region constructor
    constructor(project) {
        super(project);
    }
    //#endregion
    //#region isomorphic packages json path
    get jsonPath() {
        //#region @backendFunc
        return (0, lib_2.crossPlatformPath)([
            this.coreContainer.location,
            constants_1.tmpIsomorphicPackagesJson,
        ]);
        //#endregion
    }
    //#endregion
    //#region isomorphic packages names from json
    get isomorphicPackagesFromJson() {
        const json = lib_3.Helpers.readJson(this.jsonPath) || {};
        // console.log(`json: `,this.jsonPath )
        const arr = json[constants_1.isomorphicPackagesJsonKey] || [];
        // console.log(`isomorphicPackagess from json: `,arr);
        return arr;
    }
    //#endregion
    //#region start
    async start(reasonToSearchPackages) {
        //#region @backendFunc
        await this.coreContainer.nodeModules.makeSureInstalled();
        let recognizedPackages = [];
        lib_3.Helpers.taskStarted(`[${this.project.genericName}]\n` +
            ` Searching isomorphic packages for ${this.coreContainer.genericName}...\n` +
            (reasonToSearchPackages ? ` reason "${reasonToSearchPackages}"` : ''));
        //#region recreate json if not exists
        if (!lib_3.Helpers.exists(this.jsonPath)) {
            lib_3.Helpers.writeJson(this.jsonPath, {});
        }
        //#endregion
        //#region try to read ismoorphic packages from already exited json
        const readCurrent = () => {
            try {
                const pj = lib_3.Helpers.readJson(this.jsonPath);
                if (lib_2._.isArray(pj[constants_1.isomorphicPackagesJsonKey])) {
                    return lib_1.Utils.uniqArray(pj[constants_1.isomorphicPackagesJsonKey]);
                }
            }
            catch (error) {
                lib_3.Helpers.log(`[${lib_1.config.frameworkName}] ERROR not recognized in`);
                return [];
            }
        };
        recognizedPackages = readCurrent();
        //#endregion
        //#region search for isomorphic packages in folders
        let fromNodeModulesFolderSearch = this.coreContainer.nodeModules.getIsomorphicPackagesNames();
        //#endregion
        recognizedPackages = lib_1.Utils.uniqArray([
            ...(recognizedPackages || []),
            this.project.name,
            this.project.nameForNpmPackage,
            ...(fromNodeModulesFolderSearch || []),
            lib_1.taonPackageName,
            lib_1.tnpPackageName,
            ,
        ].filter(f => !f.startsWith(lib_1.PREFIXES.RESTORE_NPM)));
        this.resolveAndAddIsomorphicLibsToMemory(recognizedPackages);
        this.coreContainer.packagesRecognition.resolveAndAddIsomorphicLibsToMemory(lib_2._.cloneDeep(recognizedPackages));
        // Helpers.taskDone(`Search done. Watcher started...`);
        this.addIsomorphicPackagesToFile(recognizedPackages);
        lib_2.fse.watch(this.jsonPath, (eventType, filename) => {
            if (filename) {
                try {
                    const newIsomorphicPackages = readCurrent();
                    // Helpers.info(
                    //   `[${config.frameworkName}] Isomorphic packages changed...`,
                    // );
                    this.coreContainer.packagesRecognition.resolveAndAddIsomorphicLibsToMemory(lib_2._.cloneDeep(newIsomorphicPackages), true);
                }
                catch (error) { }
            }
            else {
                console.log('Filename not provided or unsupported platform.');
            }
        });
        //#endregion
    }
    //#endregion
    //#region add isomorphic packages to file
    addIsomorphicPackagesToFile(recognizedPackagesNewPackages) {
        //#region @backendFunc
        const alreadyExistsJson = lib_3.Helpers.readJsonC(this.jsonPath) || {};
        const alreadyExistsJsonArr = alreadyExistsJson[constants_1.isomorphicPackagesJsonKey] || [];
        lib_3.Helpers.writeJson(this.jsonPath, {
            [constants_1.isomorphicPackagesJsonKey]: lib_1.Utils.uniqArray(alreadyExistsJsonArr.concat(recognizedPackagesNewPackages)),
        });
        //#endregion
    }
    //#endregion
    //#region resolve and add isomorphic isomorphic packages names to memory
    resolveAndAddIsomorphicLibsToMemory(isomorphicPackagesNames, informAboutDiff = false) {
        //#region @backendFunc
        // console.log(`add ed isomorphic isomorphic packages names to memory: ${isomorphicPackagesNames.join(', ')}`);
        if (!this.coreContainer) {
            return;
        }
        if (informAboutDiff) {
            const current = this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs;
            const newAdded = isomorphicPackagesNames.filter(l => !current.includes(l));
            for (const packageName of newAdded) {
                lib_3.Helpers.info(`[${lib_1.config.frameworkName}] ${packageName} added to isomorphic packages...`);
            }
        }
        this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs =
            lib_1.Utils.uniqArray([
                ...this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs,
                ...isomorphicPackagesNames,
                this.project.name,
                this.project.nameForNpmPackage,
            ]);
        //#endregion
    }
    //#endregion
    //#region all isomorphic packages from memory
    /**
     * main source of isomorphic isomorphic packages
     */
    get allIsomorphicPackagesFromMemory() {
        //#region @backendFunc
        if (this.coreContainer?.packagesRecognition.inMemoryIsomorphicLibs.length ===
            0) {
            this.resolveAndAddIsomorphicLibsToMemory(this.coreContainer?.packagesRecognition.isomorphicPackagesFromJson, false);
            if (this.coreContainer?.packagesRecognition.inMemoryIsomorphicLibs
                .length === 0) {
                // const command =
                //   `${config.frameworkName} ` +
                //   `${UtilsCliClassMethod.getFrom($Global.prototype.reinstall, { globalMethod: true })}`;
                // this.coreContainer.run(command).sync();
                this.coreContainer
                    .run(
                // $Global.prototype.reinstall.name
                `${lib_1.config.frameworkName}  ${'reinstall'}`)
                    .sync();
                this.resolveAndAddIsomorphicLibsToMemory(this.coreContainer?.packagesRecognition.isomorphicPackagesFromJson, false);
                if (this.coreContainer?.packagesRecognition.inMemoryIsomorphicLibs
                    .length === 0) {
                    lib_3.Helpers.error(`Not able to resolve isomorphic libs for core container...`, false, true);
                }
            }
        }
        const result = lib_1.Utils.uniqArray([
            ...this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs,
            this.project.nameForNpmPackage,
            this.project.name,
        ]);
        // console.log(`allIsomorphicPackagesFromMemory: ${result.join('\n ')}`);
        return result;
        //#endregion
    }
}
exports.PackagesRecognition = PackagesRecognition;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/packages-recognition.js.map