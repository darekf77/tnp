//#region imports
import { config, PREFIXES, taonPackageName, tnpPackageName, Utils__NS__uniqArray } from 'tnp-core/lib-prod';
import { fse, crossPlatformPath, ___NS__cloneDeep, ___NS__isArray } from 'tnp-core/lib-prod';
import { BaseFeatureForProject, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__info, Helpers__NS__log, Helpers__NS__readJson, Helpers__NS__readJsonC, Helpers__NS__taskStarted, Helpers__NS__writeJson } from 'tnp-helpers/lib-prod';
import { isomorphicPackagesJsonKey, tmpIsomorphicPackagesJson, } from '../../constants';
//#endregion
/**
 * TODO refactor this - use immutable db
 */
// @ts-ignore TODO weird inheritance problem
export class PackagesRecognition extends BaseFeatureForProject {
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
        return crossPlatformPath([
            this.coreContainer.location,
            tmpIsomorphicPackagesJson,
        ]);
        //#endregion
    }
    //#endregion
    //#region isomorphic packages names from json
    get isomorphicPackagesFromJson() {
        const json = Helpers__NS__readJson(this.jsonPath) || {};
        // console.log(`json: `,this.jsonPath )
        const arr = json[isomorphicPackagesJsonKey] || [];
        // console.log(`isomorphicPackagess from json: `,arr);
        return arr;
    }
    //#endregion
    //#region start
    async start(reasonToSearchPackages) {
        //#region @backendFunc
        await this.coreContainer.nodeModules.makeSureInstalled();
        let recognizedPackages = [];
        Helpers__NS__taskStarted(`[${this.project.genericName}]\n` +
            ` Searching isomorphic packages for ${this.coreContainer.genericName}...\n` +
            (reasonToSearchPackages ? ` reason "${reasonToSearchPackages}"` : ''));
        //#region recreate json if not exists
        if (!Helpers__NS__exists(this.jsonPath)) {
            Helpers__NS__writeJson(this.jsonPath, {});
        }
        //#endregion
        //#region try to read ismoorphic packages from already exited json
        const readCurrent = () => {
            try {
                const pj = Helpers__NS__readJson(this.jsonPath);
                if (___NS__isArray(pj[isomorphicPackagesJsonKey])) {
                    return Utils__NS__uniqArray(pj[isomorphicPackagesJsonKey]);
                }
            }
            catch (error) {
                Helpers__NS__log(`[${config.frameworkName}] ERROR not recognized in`);
                return [];
            }
        };
        recognizedPackages = readCurrent();
        //#endregion
        //#region search for isomorphic packages in folders
        let fromNodeModulesFolderSearch = this.coreContainer.nodeModules.getIsomorphicPackagesNames();
        //#endregion
        recognizedPackages = Utils__NS__uniqArray([
            ...(recognizedPackages || []),
            this.project.name,
            this.project.nameForNpmPackage,
            ...(fromNodeModulesFolderSearch || []),
            taonPackageName,
            tnpPackageName,
            ,
        ].filter(f => !f.startsWith(PREFIXES.RESTORE_NPM)));
        this.resolveAndAddIsomorphicLibsToMemory(recognizedPackages);
        this.coreContainer.packagesRecognition.resolveAndAddIsomorphicLibsToMemory(___NS__cloneDeep(recognizedPackages));
        // Helpers__NS__taskDone(`Search done. Watcher started...`);
        this.addIsomorphicPackagesToFile(recognizedPackages);
        fse.watch(this.jsonPath, (eventType, filename) => {
            if (filename) {
                try {
                    const newIsomorphicPackages = readCurrent();
                    // Helpers__NS__info(
                    //   `[${config.frameworkName}] Isomorphic packages changed...`,
                    // );
                    this.coreContainer.packagesRecognition.resolveAndAddIsomorphicLibsToMemory(___NS__cloneDeep(newIsomorphicPackages), true);
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
        const alreadyExistsJson = Helpers__NS__readJsonC(this.jsonPath) || {};
        const alreadyExistsJsonArr = alreadyExistsJson[isomorphicPackagesJsonKey] || [];
        Helpers__NS__writeJson(this.jsonPath, {
            [isomorphicPackagesJsonKey]: Utils__NS__uniqArray(alreadyExistsJsonArr.concat(recognizedPackagesNewPackages)),
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
                Helpers__NS__info(`[${config.frameworkName}] ${packageName} added to isomorphic packages...`);
            }
        }
        this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs =
            Utils__NS__uniqArray([
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
                //   `${UtilsCliClassMethod__NS__getFrom($Global.prototype.reinstall, { globalMethod: true })}`;
                // this.coreContainer.run(command).sync();
                this.coreContainer
                    .run(
                // $Global.prototype.reinstall.name
                `${config.frameworkName}  ${'reinstall'}`)
                    .sync();
                this.resolveAndAddIsomorphicLibsToMemory(this.coreContainer?.packagesRecognition.isomorphicPackagesFromJson, false);
                if (this.coreContainer?.packagesRecognition.inMemoryIsomorphicLibs
                    .length === 0) {
                    Helpers__NS__error(`Not able to resolve isomorphic libs for core container...`, false, true);
                }
            }
        }
        const result = Utils__NS__uniqArray([
            ...this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs,
            this.project.nameForNpmPackage,
            this.project.name,
        ]);
        // console.log(`allIsomorphicPackagesFromMemory: ${result.join('\n ')}`);
        return result;
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/packages-recognition.js.map