"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$New = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
const options_1 = require("../../options");
const project_1 = require("../abstract/project");
const taonJson_1 = require("../abstract/taonJson");
const base_cli_1 = require("./base-cli");
//#endregion
class $New extends base_cli_1.BaseCli {
    async _() {
        await this._createContainersOrStandalone({
            name: this.firstArg,
            cwd: this.cwd,
        });
        this._exit();
    }
    async open() {
        const appName = await this._createContainersOrStandalone({
            name: this.firstArg,
            cwd: this.cwd,
        });
        lib_4.UtilsVSCode.openFolder((0, lib_3.crossPlatformPath)([this.cwd, appName]));
        this._exit();
    }
    //#region init containers
    async _initContainersAndApps(cwd, nameFromArgs) {
        //#region @backendFunc
        //#region resolve variables
        nameFromArgs = nameFromArgs.replace('./', '');
        nameFromArgs = nameFromArgs.replace('.\\', '');
        nameFromArgs = nameFromArgs.replace(/\/$/, '');
        nameFromArgs = nameFromArgs.replace(/\\$/, '');
        nameFromArgs = nameFromArgs.replace(/\\$/g, '/');
        const orgArgName = nameFromArgs;
        const shouldBeOrganization = (containerName) => {
            // console.log(`Checking if ${containerName} should be organization`);
            const shouldBeOrg = !lib_3._.isUndefined(orgArgName.split('/').find(f => {
                return f.includes('@') && f.replace('@', '') === containerName;
            }));
            if (shouldBeOrg) {
                lib_4.Helpers.info(`Container: ${containerName} will be mark as organization container`);
            }
            // console.log({ orgArgName, containerName, shouldBeOrg });
            return shouldBeOrg;
        };
        nameFromArgs = nameFromArgs.replace(/\@/g, '');
        /**
         * examples:
         * my-app
         * my-org/my-app
         * my-big-org/my-smaller-org/my-app
         * ..
         */
        const allProjectFromArgs = nameFromArgs.includes('/')
            ? nameFromArgs.split('/')
            : [nameFromArgs];
        const hasAutoCreateNormalContainersFromArgs = allProjectFromArgs.length > 2;
        const hasAtLeastOneContainersFromArgs = allProjectFromArgs.length > 1;
        // app OR org/app
        const standaloneOrOrgWithStanalonePathName = (0, lib_3.crossPlatformPath)([
            lib_3.path.basename(lib_3.path.dirname(allProjectFromArgs.join('/'))),
            lib_3.path.basename(allProjectFromArgs.join('/')),
        ]);
        // additional auto created normal containers
        const autoCreateNormalContainersPathName = (hasAutoCreateNormalContainersFromArgs
            ? allProjectFromArgs
                .join('/')
                .replace(standaloneOrOrgWithStanalonePathName, '')
            : '').replace(/\/$/, '');
        const lastProjectFromArgName = allProjectFromArgs.length > 0
            ? lib_3._.last(allProjectFromArgs) // last org proj
            : lib_3._.first(allProjectFromArgs); // standalone proj
        //#endregion
        // debugger;
        //#region check if name is allowed
        const notAllowedNameForApp = lib_2.notAllowedProjectNames.find(a => a === lastProjectFromArgName);
        if (!!notAllowedNameForApp) {
            lib_4.Helpers.error(`

       Name ${lib_3.chalk.bold(notAllowedNameForApp)} is not allowed.

       Use different name: ${lib_3.chalk.bold((0, lib_3.crossPlatformPath)(allProjectFromArgs.join('/')).replace(notAllowedNameForApp, 'my-app-or-something-else'))}

       `, false, true);
        }
        //#endregion
        let firstContainer;
        let lastContainer;
        let lastIsBrandNew = false;
        const grandpa = project_1.Project.ins.From(cwd);
        const containers = [
            ...(grandpa && grandpa.framework.isContainer ? [grandpa] : []),
        ];
        if (hasAtLeastOneContainersFromArgs) {
            const foldersToRecreate = lib_3._.cloneDeep(allProjectFromArgs).slice(0, allProjectFromArgs.length - 1);
            let tmpCwd = cwd;
            let parentContainer = project_1.Project.ins.From(cwd);
            let currentContainer;
            do {
                const folder = foldersToRecreate.shift();
                const isLastContainer = foldersToRecreate.length === 0;
                const currentContainerPath = lib_3.path.join(tmpCwd, folder);
                const isBrandNew = !lib_4.Helpers.exists(currentContainerPath);
                if (isBrandNew) {
                    lib_4.Helpers.mkdirp(currentContainerPath);
                }
                const packageJsonPath = lib_3.path.join(currentContainerPath, constants_1.packageJsonMainProject);
                const taonJsoncPath = lib_3.path.join(currentContainerPath, constants_1.taonJsonMainProject);
                if (!lib_4.Helpers.exists(packageJsonPath)) {
                    lib_4.Helpers.writeJson(packageJsonPath, {
                        name: lib_3.path.basename(currentContainerPath),
                        version: '0.0.0',
                    });
                    lib_4.Helpers.writeJson(taonJsoncPath, {
                        version: constants_1.DEFAULT_FRAMEWORK_VERSION,
                        type: lib_1.LibTypeEnum.CONTAINER,
                        monorepo: true,
                        organization: shouldBeOrganization(lib_3.path.basename(lib_3.path.dirname(taonJsoncPath))),
                    });
                }
                currentContainer = project_1.Project.ins.From(currentContainerPath);
                containers.push(currentContainer);
                if (parentContainer?.framework.isContainer) {
                    parentContainer.linkedProjects.addLinkedProject(lib_3.path.basename(currentContainer.location));
                }
                parentContainer = currentContainer;
                if (isLastContainer &&
                    isBrandNew &&
                    !parentContainer &&
                    !currentContainer.git.isInsideGitRepo) {
                    try {
                        currentContainer.run('git init').sync();
                        try {
                            if (currentContainer.git.currentBranchName !== 'master') {
                                currentContainer.run('git checkout -b master').sync();
                            }
                        }
                        catch (error) { }
                    }
                    catch (error) {
                        lib_4.Helpers.warn(`Not able to init git inside container: ${currentContainer?.location}`);
                    }
                }
                if (!firstContainer) {
                    firstContainer = currentContainer;
                }
                if (isLastContainer) {
                    lastContainer = currentContainer;
                }
                if (isLastContainer && isBrandNew) {
                    lastIsBrandNew = true;
                }
                tmpCwd = currentContainerPath;
            } while (foldersToRecreate.length > 0);
        }
        //#region init create standalone project or container child
        let appProj;
        const appLocation = lastContainer
            ? (0, lib_3.crossPlatformPath)([lastContainer?.location, lastProjectFromArgName])
            : (0, lib_3.crossPlatformPath)([cwd, lastProjectFromArgName]);
        const packageJson = new lib_4.BasePackageJson({
            cwd: (0, lib_3.crossPlatformPath)([appLocation, constants_1.packageJsonMainProject]),
            defaultValue: {},
        });
        packageJson.setIsPrivate(true);
        packageJson.setVersion('0.0.0');
        packageJson.setName(lib_3.path.basename(lastProjectFromArgName));
        const taonJson = new taonJson_1.TaonJson(project_1.Project.ins.From(packageJson.cwd), {});
        taonJson.setType(lib_1.LibTypeEnum.ISOMORPHIC_LIB);
        taonJson.setFrameworkVersion(constants_1.DEFAULT_FRAMEWORK_VERSION);
        taonJson.overridePackageJsonManager.setIsPrivate(true);
        // taonJson.shouldGenerateAutogenAppRoutesFile = true;
        taonJson.setShouldGenerateAutogenIndexFile(true);
        taonJson.autoReleaseConfigAllowedItems =
            project_1.Project.ins.by('isomorphic-lib').taonJson.autoReleaseConfigAllowedItems;
        project_1.Project.ins.unload(appLocation);
        appProj = project_1.Project.ins.From(appLocation);
        if (!hasAtLeastOneContainersFromArgs) {
            lastContainer = appProj.parent;
        }
        let initGit = true;
        if (lastContainer?.framework?.isContainer && lastContainer.isMonorepo) {
            initGit = false;
            lib_4.Helpers.info(`Not initing git since ${lib_3.path.basename(appLocation)} is inside container monorepo`);
        }
        if (lib_4.HelpersTaon.git.isInsideGitRepo(appLocation)) {
            initGit = false;
            lib_4.Helpers.info(`Not initing git since ${lib_3.path.basename(appLocation)} is inside git repo`);
        }
        if (initGit) {
            try {
                appProj.run('git init').sync();
            }
            catch (error) {
                initGit = false;
                console.log(error);
                lib_4.Helpers.warn(`Not able to init git inside: ${appProj.location}`);
            }
        }
        if (initGit) {
            // if(HelpersTaon.git.)
            try {
                appProj.run('git add --all . && git commit -m "first"').sync();
            }
            catch (error) {
                initGit = false;
                console.log(error);
                lib_4.Helpers.warn(`Not add "first" commit inside repository: ${appProj.location}`);
            }
        }
        if (initGit) {
            try {
                if (appProj.git.currentBranchName !== 'master') {
                    appProj.run('git checkout -b master').sync();
                }
            }
            catch (error) { }
        }
        appProj.artifactsManager.globalHelper.addSrcFolderFromCoreProject();
        //#endregion
        // console.log({
        //   appProj,
        // });
        if (lastContainer) {
            lastContainer.taonJson.setType(lib_1.LibTypeEnum.CONTAINER);
        }
        await appProj.init(this.params.clone({
            purpose: 'initing new app',
            release: {
                targetArtifact: options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
            },
        }));
        if (lastContainer) {
            lastContainer.linkedProjects.addLinkedProject(lastProjectFromArgName);
        }
        appProj.vsCodeHelpers.toogleFilesVisibilityInVscode({
            action: 'hide-files',
        });
        if (initGit) {
            try {
                appProj
                    .run('git add --all . && git commit -m "chore: initial structure"')
                    .sync();
            }
            catch (error) {
                console.log(error);
                lib_4.Helpers.warn(`Not able to init git inside: ${appProj.location}`);
            }
        }
        if (appProj.git.isGitRoot) {
            try {
                this._addRemoteToStandalone(appProj);
            }
            catch (error) { }
        }
        return {
            containers,
            firstContainer,
            lastContainer,
            lastIsBrandNew,
            appProj,
            containersAndProjFromArgName: allProjectFromArgs,
            preOrgs: autoCreateNormalContainersPathName,
            initGit,
        };
        //#endregion
    }
    //#endregion
    //#region add remote to sta1ndalone
    _addRemoteToStandalone(appProj) {
        if (appProj.framework.isStandaloneProject) {
            const lastContainer = appProj.parent;
            const ADDRESS_GITHUB_SSH_PARENT = lastContainer?.git?.originURL;
            const newRemote = ADDRESS_GITHUB_SSH_PARENT &&
                ADDRESS_GITHUB_SSH_PARENT?.replace(`${lastContainer.name}.git`, `${appProj.name}.git`);
            if (newRemote) {
                try {
                    appProj
                        .run('git remote add origin ' + newRemote, {
                        output: false,
                        silence: true,
                    })
                        .sync();
                }
                catch (error) { }
            }
        }
    }
    //#endregion
    //#region create container or standalone
    async _createContainersOrStandalone(options) {
        let { name: nameFromArgs, cwd } = options;
        const { appProj, containers, lastContainer, lastIsBrandNew, initGit } = await this._initContainersAndApps(cwd, nameFromArgs);
        lib_4.Helpers.writeFile([appProj.location, constants_1.readmeMdMainProject], `# ${appProj.name}

Hello from Standalone Project

       `);
        if (initGit) {
            try {
                appProj
                    .run(`git add --all . && git commit -m "docs: README.md update"`)
                    .sync();
            }
            catch (error) { }
        }
        if (lastIsBrandNew) {
            lastContainer.writeFile(constants_1.readmeMdMainProject, `# @${lastContainer.name}

Hello from Container Project

       `);
        }
        for (let index = 0; index < containers.length; index++) {
            const container = containers[index];
            await container.init(this.params.clone({
                purpose: 'initing new container',
            }));
            await container.vsCodeHelpers.init();
        }
        lib_4.Helpers.info(`DONE CREATING ${nameFromArgs}`);
        return appProj.name;
    }
}
exports.$New = $New;
exports.default = {
    $New: lib_4.HelpersTaon.CLIWRAP($New, '$New'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-NEW.js.map