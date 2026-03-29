//#region imports
import { MagicRenamer } from 'magic-renamer/lib-prod';
import { containerPrefix, tmpIsomorphicPackagesJson } from '../../constants';
import { config, path, tnpPackageName } from 'tnp-core/lib-prod';
import { crossPlatformPath, ___NS__first, UtilsTerminal__NS__confirm } from 'tnp-core/lib-prod';
import { BasePackageJson, Helpers__NS__error, Helpers__NS__foldersFrom, Helpers__NS__info, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__warn, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__copyFile } from 'tnp-helpers/lib-prod';
import { ReleaseType } from '../../options';
import { BaseCli } from './base-cli';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class $Core extends BaseCli {
    async __initialize__() {
        if (config.frameworkName !== tnpPackageName) {
            Helpers__NS__error(`

        This command is only for ${tnpPackageName} dev cli.

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
        if (config.frameworkName !== tnpPackageName) {
            Helpers__NS__error(`
        This command is only for ${tnpPackageName} dev cli.
      `, false, true);
        }
        if (!this.project ||
            this.project.name !== 'taon-dev' ||
            !this.project.framework.isContainer) {
            Helpers__NS__error(`
        This command is only for ${tnpPackageName} container project 'taon-dev'.
      `, false, true);
        }
        const latestCoreContainer = this.project.framework.coreContainer;
        const coreContainerParentLocation = path.dirname(latestCoreContainer.location);
        const latestCoreContainerVersion = ___NS__first(Helpers__NS__foldersFrom(coreContainerParentLocation)
            .filter(f => path.basename(f).startsWith(containerPrefix))
            .map(f => path.basename(f.replace(containerPrefix + 'v', '')))
            .map(c => Number(c))
            .sort((a, b) => b - a));
        Helpers__NS__info(`Latest core container version: ${latestCoreContainerVersion}`);
        const continueOperation = await UtilsTerminal__NS__confirm({
            message: `Create new core container version v${latestCoreContainerVersion + 1} based on v${latestCoreContainerVersion}?`,
            defaultValue: true,
        });
        if (!continueOperation) {
            Helpers__NS__warn(`Operation cancelled by user.`);
            this._exit();
            return;
        }
        const newVersionOfCore = latestCoreContainerVersion + 1;
        const magicRenameRules = `v${latestCoreContainerVersion} -> v${newVersionOfCore}`;
        Helpers__NS__info(`Creating new core... ${magicRenameRules} `);
        const ins = MagicRenamer.Instance(latestCoreContainer.location);
        ins.start(magicRenameRules);
        const newContainer = this.project.ins.From([
            coreContainerParentLocation,
            containerPrefix + 'v' + newVersionOfCore,
        ]);
        Helpers__NS__taskDone(`New core created at ${crossPlatformPath(newContainer.location)}`);
        Helpers__NS__taskStarted(`Updating dependencies from NPM...`);
        await newContainer.taonJson.updateDependenciesFromNpm({
        // onlyPackageNames: this.args,
        });
        // console.log({
        //   newestCoreContainerVersion: latestCoreContainerVersion,
        //   coreContainerParentLocation,
        // });
        Helpers__NS__taskDone(`Dependencies updated.`);
        Helpers__NS__taskStarted(`Copying node_modules and isomorphic packages from old to new container...`);
        this.project.framework.coreContainer.nodeModules.copyToProject(newContainer);
        HelpersTaon__NS__copyFile(this.project.framework.coreContainer.pathFor(tmpIsomorphicPackagesJson), newContainer.pathFor(tmpIsomorphicPackagesJson));
        Helpers__NS__taskDone(`Copy done.`);
        Helpers__NS__taskStarted(`Setting new NPM and framework version... for this project and children`);
        await this.project.framework.setNpmVersion(`${newVersionOfCore}.0.0`);
        Helpers__NS__taskStarted(`Setting framework version... for this project and children`);
        await newContainer.framework.setFrameworkVersion(`v${newVersionOfCore}`);
        Helpers__NS__taskStarted(`Creating new core release for all projects...`);
        await this.project.release(this.params.clone({
            release: {
                autoReleaseUsingConfig: true,
                autoReleaseTaskName: 'npm',
                releaseVersionBumpType: 'patch',
                releaseType: ReleaseType.MANUAL,
            },
        }));
        Helpers__NS__taskDone(`New core release created.`);
        Helpers__NS__taskDone(`Done creating new core ${containerPrefix}v${newVersionOfCore}`);
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
        const pathToSourceProject = crossPlatformPath(path.isAbsolute(this.firstArg)
            ? this.firstArg
            : path.join(this.cwd, this.firstArg));
        Helpers__NS__info(`Updating dependencies from: ${pathToSourceProject}`);
        const proj = this.project.ins.From(pathToSourceProject);
        const pjSource = new BasePackageJson({
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
        Helpers__NS__taskDone(`Dependencies updated from ${pathToSourceProject}`);
        this._exit();
        //#endregion
    }
}
export default {
    $Core: HelpersTaon__NS__CLIWRAP($Core, '$Core'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-CORE.js.map