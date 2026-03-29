import { gte, valid } from 'semver';
import { config, LibTypeEnum } from 'tnp-core/lib-prod';
import { crossPlatformPath, fg, path, ___NS__cloneDeep, ___NS__isArray, ___NS__isNil, ___NS__isObject, ___NS__merge, Helpers__NS__logInfo, Helpers__NS__readFile, Helpers__NS__warn, Utils__NS__sortKeys } from 'tnp-core/lib-prod';
import { BasePackageJson, } from 'tnp-helpers/lib-prod';
import { binMainProject, scriptsCommands } from '../../constants';
export class PackageJSON extends BasePackageJson {
    project;
    KEY_TNP_PACKAGE_JSON = 'tnp';
    constructor(options, project) {
        super(options);
        this.project = project;
    }
    updateDataFromTaonJson() {
        if (this.project.taonJson.exists) {
            const packageJsonOverride = this.project.taonJson.overridePackageJsonManager.getAllData();
            if (___NS__isObject(packageJsonOverride) && !___NS__isArray(packageJsonOverride)) {
                this.data = ___NS__merge(this.data, packageJsonOverride);
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
            if (___NS__isObject(packageJsonOverride) && !___NS__isArray(packageJsonOverride)) {
                this.data = packageJsonOverride;
            }
        }
    }
    recreateBin() {
        // Helpers__NS__taskStarted('Recreating bin...');
        const pattern = `${this.project.pathFor(binMainProject)}/*`;
        const countLinkInPackageJsonBin = fg
            .sync(pattern)
            .map(f => crossPlatformPath(f))
            .filter(f => {
            return (Helpers__NS__readFile(f) || '').startsWith('#!/usr/bin/env');
        });
        const bin = {};
        countLinkInPackageJsonBin.forEach(p => {
            bin[path.basename(p)] = `${binMainProject}/${path.basename(p)}`;
        });
        // Helpers__NS__taskDone('done recreating bin...');
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
                if (___NS__isObject(depObj)) {
                    for (const depName in depObj) {
                        if (___NS__isNil(depObj[depName])) {
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
            const sorted = Utils__NS__sortKeys(___NS__cloneDeep(this.data));
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
            if (this.project.taonJson.type === LibTypeEnum.ISOMORPHIC_LIB) {
                for (const command of scriptsCommands) {
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
        const pj = new BasePackageJson({
            jsonContent: {
                version: this.project.packageJson.getBumpedVersionFor(releaseVersionBumpType),
            },
            reloadInMemoryCallback: data => {
                // console.log('new pj data', data);
            },
        });
        const lastTagVersion = this.project.git.lastTagVersionName.trim().replace('v', '') || '0.0.0';
        if (valid(lastTagVersion) === null) {
            Helpers__NS__warn(`[${config.frameworkName}]

        Last tag may not be proper version: "${lastTagVersion}"

        `);
            return pj.version;
        }
        const pjtag = new BasePackageJson({
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
                Helpers__NS__logInfo('Resolving new version...');
            }
            if (!pjtag.version) {
                return pj.version;
            }
            // console.log(`pj.version`, pj.version);
            // console.log(`pjtag.version`, pjtag.version);
            if (gte(pj.version, pjtag.version)) {
                return pj.version;
            }
            pj.setVersion(pjtag.version);
        }
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/package-json.js.map