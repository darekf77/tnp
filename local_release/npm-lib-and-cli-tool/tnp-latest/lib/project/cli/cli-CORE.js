"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Core = void 0;
//#region imports
const lib_1 = require("magic-renamer/lib");
const constants_1 = require("../../constants");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const options_1 = require("../../options");
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Core extends base_cli_1.BaseCli {
    async __initialize__() {
        if (lib_2.config.frameworkName !== lib_2.tnpPackageName) {
            lib_4.Helpers.error(`

        This command is only for ${lib_2.tnpPackageName} dev cli.

        `, false, true);
        }
        await super.__initialize__();
    }
    async _() {
        console.log('hello world');
        this._exit();
    }
    async createNext() {
        //#region @backendFunc
        if (lib_2.config.frameworkName !== lib_2.tnpPackageName) {
            lib_4.Helpers.error(`
        This command is only for ${lib_2.tnpPackageName} dev cli.
      `, false, true);
        }
        if (!this.project ||
            this.project.name !== 'taon-dev' ||
            !this.project.framework.isContainer) {
            lib_4.Helpers.error(`
        This command is only for ${lib_2.tnpPackageName} container project 'taon-dev'.
      `, false, true);
        }
        const latestCoreContainer = this.project.framework.coreContainer;
        const coreContainerParentLocation = lib_2.path.dirname(latestCoreContainer.location);
        const latestCoreContainerVersion = lib_3._.first(lib_4.Helpers.foldersFrom(coreContainerParentLocation)
            .filter(f => lib_2.path.basename(f).startsWith(constants_1.containerPrefix))
            .map(f => lib_2.path.basename(f.replace(constants_1.containerPrefix + 'v', '')))
            .map(c => Number(c))
            .sort((a, b) => b - a));
        lib_4.Helpers.info(`Latest core container version: ${latestCoreContainerVersion}`);
        const continueOperation = await lib_3.UtilsTerminal.confirm({
            message: `Create new core container version v${latestCoreContainerVersion + 1} based on v${latestCoreContainerVersion}?`,
            defaultValue: true,
        });
        if (!continueOperation) {
            lib_4.Helpers.warn(`Operation cancelled by user.`);
            this._exit();
            return;
        }
        const newVersionOfCore = latestCoreContainerVersion + 1;
        const magicRenameRules = `v${latestCoreContainerVersion} -> v${newVersionOfCore}`;
        lib_4.Helpers.info(`Creating new core... ${magicRenameRules} `);
        const ins = lib_1.MagicRenamer.Instance(latestCoreContainer.location);
        ins.start(magicRenameRules);
        const newContainer = this.project.ins.From([
            coreContainerParentLocation,
            constants_1.containerPrefix + 'v' + newVersionOfCore,
        ]);
        lib_4.Helpers.taskDone(`New core created at ${(0, lib_3.crossPlatformPath)(newContainer.location)}`);
        lib_4.Helpers.taskStarted(`Updating dependencies from NPM...`);
        await newContainer.taonJson.updateDependenciesFromNpm({
        // onlyPackageNames: this.args,
        });
        // console.log({
        //   newestCoreContainerVersion: latestCoreContainerVersion,
        //   coreContainerParentLocation,
        // });
        lib_4.Helpers.taskDone(`Dependencies updated.`);
        lib_4.Helpers.taskStarted(`Copying node_modules and isomorphic packages from old to new container...`);
        this.project.framework.coreContainer.nodeModules.copyToProject(newContainer);
        lib_4.HelpersTaon.copyFile(this.project.framework.coreContainer.pathFor(constants_1.tmpIsomorphicPackagesJson), newContainer.pathFor(constants_1.tmpIsomorphicPackagesJson));
        lib_4.Helpers.taskDone(`Copy done.`);
        lib_4.Helpers.taskStarted(`Setting new NPM and framework version... for this project and children`);
        await this.project.framework.setNpmVersion(`${newVersionOfCore}.0.0`);
        lib_4.Helpers.taskStarted(`Setting framework version... for this project and children`);
        await newContainer.framework.setFrameworkVersion(`v${newVersionOfCore}`);
        lib_4.Helpers.taskStarted(`Creating new core release for all projects...`);
        await this.project.release(this.params.clone({
            release: {
                autoReleaseUsingConfig: true,
                autoReleaseTaskName: 'npm',
                releaseVersionBumpType: 'patch',
                releaseType: options_1.ReleaseType.MANUAL,
            },
        }));
        lib_4.Helpers.taskDone(`New core release created.`);
        lib_4.Helpers.taskDone(`Done creating new core ${constants_1.containerPrefix}v${newVersionOfCore}`);
        this._exit();
        //#endregion
    }
    //#region set npm clean major version
    async setNpmVersion() {
        let npmVersion = this.firstArg;
        await this.project.framework.setNpmVersion(npmVersion, {
            confirm: true,
        });
        this._exit();
    }
    //#endregion
    //#region set framework version
    async setFrameworkVersion() {
        const newFrameworkVersion = `v${this.firstArg.replace('v', '')}`;
        await this.project.framework.setFrameworkVersion(newFrameworkVersion, {
            confirm: true,
        });
        this._exit();
    }
    //#endregion
    updateDepsFrom() {
        //#region @backendFunc
        const pathToSourceProject = (0, lib_3.crossPlatformPath)(lib_2.path.isAbsolute(this.firstArg)
            ? this.firstArg
            : lib_2.path.join(this.cwd, this.firstArg));
        lib_4.Helpers.info(`Updating dependencies from: ${pathToSourceProject}`);
        const proj = this.project.ins.From(pathToSourceProject);
        const pjSource = new lib_4.BasePackageJson({
            cwd: proj.packageJson.cwd,
        });
        const alldeps = Object.keys(pjSource.allDependencies);
        const currentDeps = this.project.taonJson.overridePackageJsonManager.allDependencies;
        for (const depnName of alldeps) {
            const depVersion = pjSource.allDependencies[depnName];
            const currentVersion = currentDeps[depnName];
            const curretnPrefix = currentVersion
                ? currentVersion.startsWith('^')
                    ? '^'
                    : currentVersion.startsWith('~')
                        ? '~'
                        : ''
                : '';
            this.project.taonJson.overridePackageJsonManager.updateDependency({
                packageName: depnName,
                version: `${curretnPrefix}${depVersion}`,
                createNewEntryIfNotExist: true,
            });
        }
        lib_4.Helpers.taskDone(`Dependencies updated from ${pathToSourceProject}`);
        this._exit();
        //#endregion
    }
}
exports.$Core = $Core;
exports.default = {
    $Core: lib_4.HelpersTaon.CLIWRAP($Core, '$Core'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-CORE.js.map