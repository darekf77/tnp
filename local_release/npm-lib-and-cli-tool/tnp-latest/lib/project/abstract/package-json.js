"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageJSON = void 0;
const semver_1 = require("semver");
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
class PackageJSON extends lib_3.BasePackageJson {
    project;
    KEY_TNP_PACKAGE_JSON = 'tnp';
    constructor(options, project) {
        super(options);
        this.project = project;
    }
    updateDataFromTaonJson() {
        if (this.project.taonJson.exists) {
            const packageJsonOverride = this.project.taonJson.overridePackageJsonManager.getAllData();
            if (lib_2._.isObject(packageJsonOverride) && !lib_2._.isArray(packageJsonOverride)) {
                this.data = lib_2._.merge(this.data, packageJsonOverride);
            }
        }
    }
    setDataFromCoreContainer() {
        if (this.project.framework.isCoreProject &&
            this.project.framework.isContainer) {
            return; // do not update from core container
        }
        if (this.project.framework.coreContainer.taonJson.exists) {
            const packageJsonOverride = this.project.framework.coreContainer.taonJson.overridePackageJsonManager.getAllData();
            if (lib_2._.isObject(packageJsonOverride) && !lib_2._.isArray(packageJsonOverride)) {
                this.data = packageJsonOverride;
            }
        }
    }
    recreateBin() {
        // Helpers.taskStarted('Recreating bin...');
        const pattern = `${this.project.pathFor(constants_1.binMainProject)}/*`;
        const countLinkInPackageJsonBin = lib_2.fg
            .sync(pattern)
            .map(f => (0, lib_2.crossPlatformPath)(f))
            .filter(f => {
            return (lib_2.Helpers.readFile(f) || '').startsWith('#!/usr/bin/env');
        });
        const bin = {};
        countLinkInPackageJsonBin.forEach(p => {
            bin[lib_2.path.basename(p)] = `${constants_1.binMainProject}/${lib_2.path.basename(p)}`;
        });
        // Helpers.taskDone('done recreating bin...');
        return bin;
    }
    saveToDisk(purpose) {
        //#region @backendFunc
        if (this.project.framework.isStandaloneProject ||
            this.project.framework.isContainer) {
            const versionToPreserve = this.data.version;
            delete this.data[this.KEY_TNP_PACKAGE_JSON];
            this.setDataFromCoreContainer();
            this.updateDataFromTaonJson();
            for (const depTyp of this.dependenciesTypesArray) {
                const depObj = this.data[depTyp];
                if (lib_2._.isObject(depObj)) {
                    for (const depName in depObj) {
                        if (lib_2._.isNil(depObj[depName])) {
                            delete depObj[depName];
                        }
                    }
                }
            }
            this.data.name = this.project.nameForNpmPackage;
            this.data.version = versionToPreserve;
            if (!this.data.version) {
                this.data.version = '0.0.0';
            }
            this.data.main = 'dist/app.electron.js'; // fix for electron
            const showFirst = [
                'name',
                'version',
                'scripts',
                'license',
                'author',
                'private',
                'homepage',
            ];
            const sorted = lib_2.Utils.sortKeys(lib_2._.cloneDeep(this.data));
            for (const key of showFirst) {
                delete sorted[key];
            }
            const destinationObject = {
                ...showFirst.reduce((acc, key) => {
                    acc[key] = this.data[key];
                    return acc;
                }, {}),
                ...sorted,
            };
            destinationObject.scripts = destinationObject.scripts || {};
            if (this.project.taonJson.type === lib_1.LibTypeEnum.ISOMORPHIC_LIB) {
                for (const command of constants_1.scriptsCommands) {
                    destinationObject.scripts[command] = command;
                }
            }
            destinationObject.bin = this.recreateBin();
            // TODO this causes issues with export js
            delete destinationObject.exports;
            // destinationObject.exports = {
            //   '.': {
            //     style: './scss/index.scss',
            //   },
            // };
            this.data = destinationObject;
        }
        super.saveToDisk();
        //#endregion
    }
    resolvePossibleNewVersion(releaseVersionBumpType) {
        //#region @backendFunc
        const pj = new lib_3.BasePackageJson({
            jsonContent: {
                version: this.project.packageJson.getBumpedVersionFor(releaseVersionBumpType),
            },
            reloadInMemoryCallback: data => {
                // console.log('new pj data', data);
            },
        });
        const lastTagVersion = this.project.git.lastTagVersionName.trim().replace('v', '') || '0.0.0';
        if ((0, semver_1.valid)(lastTagVersion) === null) {
            lib_2.Helpers.warn(`[${lib_1.config.frameworkName}]

        Last tag may not be proper version: "${lastTagVersion}"

        `);
            return pj.version;
        }
        const pjtag = new lib_3.BasePackageJson({
            jsonContent: { version: lastTagVersion },
            reloadInMemoryCallback: data => {
                // console.log('new pj data', data);
            },
        });
        if (pjtag.version) {
            pjtag.setVersion(pjtag.getBumpedVersionFor(releaseVersionBumpType));
        }
        let i = 0;
        while (true) {
            if (i++ > 10) {
                lib_2.Helpers.logInfo('Resolving new version...');
            }
            if (!pjtag.version) {
                return pj.version;
            }
            // console.log(`pj.version`, pj.version);
            // console.log(`pjtag.version`, pjtag.version);
            if ((0, semver_1.gte)(pj.version, pjtag.version)) {
                return pj.version;
            }
            pj.setVersion(pjtag.version);
        }
        //#endregion
    }
}
exports.PackageJSON = PackageJSON;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/package-json.js.map