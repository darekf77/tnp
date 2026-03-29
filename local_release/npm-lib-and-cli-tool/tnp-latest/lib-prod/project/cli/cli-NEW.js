//#region imports
import { LibTypeEnum } from 'tnp-core/lib-prod';
import { notAllowedProjectNames } from 'tnp-core/lib-prod';
import { chalk, crossPlatformPath, path, ___NS__cloneDeep, ___NS__first, ___NS__isUndefined, ___NS__last } from 'tnp-core/lib-prod';
import { BasePackageJson, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__info, Helpers__NS__mkdirp, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__git__NS__isInsideGitRepo, UtilsVSCode__NS__openFolder } from 'tnp-helpers/lib-prod';
import { DEFAULT_FRAMEWORK_VERSION, packageJsonMainProject, readmeMdMainProject, taonJsonMainProject, } from '../../constants';
import { ReleaseArtifactTaon } from '../../options';
import { Project } from '../abstract/project';
import { TaonJson } from '../abstract/taonJson';
import { BaseCli } from './base-cli';
//#endregion
export class $New extends BaseCli {
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
        UtilsVSCode__NS__openFolder(crossPlatformPath([this.cwd, appName]));
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
            const shouldBeOrg = !___NS__isUndefined(orgArgName.split('/').find(f => {
                return f.includes('@') && f.replace('@', '') === containerName;
            }));
            if (shouldBeOrg) {
                Helpers__NS__info(`Container: ${containerName} will be mark as organization container`);
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
        const standaloneOrOrgWithStanalonePathName = crossPlatformPath([
            path.basename(path.dirname(allProjectFromArgs.join('/'))),
            path.basename(allProjectFromArgs.join('/')),
        ]);
        // additional auto created normal containers
        const autoCreateNormalContainersPathName = (hasAutoCreateNormalContainersFromArgs
            ? allProjectFromArgs
                .join('/')
                .replace(standaloneOrOrgWithStanalonePathName, '')
            : '').replace(/\/$/, '');
        const lastProjectFromArgName = allProjectFromArgs.length > 0
            ? ___NS__last(allProjectFromArgs) // last org proj
            : ___NS__first(allProjectFromArgs); // standalone proj
        //#endregion
        // debugger;
        //#region check if name is allowed
        const notAllowedNameForApp = notAllowedProjectNames.find(a => a === lastProjectFromArgName);
        if (!!notAllowedNameForApp) {
            Helpers__NS__error(`

       Name ${chalk.bold(notAllowedNameForApp)} is not allowed.

       Use different name: ${chalk.bold(crossPlatformPath(allProjectFromArgs.join('/')).replace(notAllowedNameForApp, 'my-app-or-something-else'))}

       `, false, true);
        }
        //#endregion
        let firstContainer;
        let lastContainer;
        let lastIsBrandNew = false;
        const grandpa = Project.ins.From(cwd);
        const containers = [
            ...(grandpa && grandpa.framework.isContainer ? [grandpa] : []),
        ];
        if (hasAtLeastOneContainersFromArgs) {
            const foldersToRecreate = ___NS__cloneDeep(allProjectFromArgs).slice(0, allProjectFromArgs.length - 1);
            let tmpCwd = cwd;
            let parentContainer = Project.ins.From(cwd);
            let currentContainer;
            do {
                const folder = foldersToRecreate.shift();
                const isLastContainer = foldersToRecreate.length === 0;
                const currentContainerPath = path.join(tmpCwd, folder);
                const isBrandNew = !Helpers__NS__exists(currentContainerPath);
                if (isBrandNew) {
                    Helpers__NS__mkdirp(currentContainerPath);
                }
                const packageJsonPath = path.join(currentContainerPath, packageJsonMainProject);
                const taonJsoncPath = path.join(currentContainerPath, taonJsonMainProject);
                if (!Helpers__NS__exists(packageJsonPath)) {
                    Helpers__NS__writeJson(packageJsonPath, {
                        name: path.basename(currentContainerPath),
                        version: '0.0.0',
                    });
                    Helpers__NS__writeJson(taonJsoncPath, {
                        version: DEFAULT_FRAMEWORK_VERSION,
                        type: LibTypeEnum.CONTAINER,
                        monorepo: true,
                        organization: shouldBeOrganization(path.basename(path.dirname(taonJsoncPath))),
                    });
                }
                currentContainer = Project.ins.From(currentContainerPath);
                containers.push(currentContainer);
                if (parentContainer?.framework.isContainer) {
                    parentContainer.linkedProjects.addLinkedProject(path.basename(currentContainer.location));
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
                        Helpers__NS__warn(`Not able to init git inside container: ${currentContainer?.location}`);
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
            ? crossPlatformPath([lastContainer?.location, lastProjectFromArgName])
            : crossPlatformPath([cwd, lastProjectFromArgName]);
        const packageJson = new BasePackageJson({
            cwd: crossPlatformPath([appLocation, packageJsonMainProject]),
            defaultValue: {},
        });
        packageJson.setIsPrivate(true);
        packageJson.setVersion('0.0.0');
        packageJson.setName(path.basename(lastProjectFromArgName));
        const taonJson = new TaonJson(Project.ins.From(packageJson.cwd), {});
        taonJson.setType(LibTypeEnum.ISOMORPHIC_LIB);
        taonJson.setFrameworkVersion(DEFAULT_FRAMEWORK_VERSION);
        taonJson.overridePackageJsonManager.setIsPrivate(true);
        // taonJson.shouldGenerateAutogenAppRoutesFile = true;
        taonJson.setShouldGenerateAutogenIndexFile(true);
        taonJson.autoReleaseConfigAllowedItems =
            Project.ins.by('isomorphic-lib').taonJson.autoReleaseConfigAllowedItems;
        Project.ins.unload(appLocation);
        appProj = Project.ins.From(appLocation);
        if (!hasAtLeastOneContainersFromArgs) {
            lastContainer = appProj.parent;
        }
        let initGit = true;
        if (lastContainer?.framework?.isContainer && lastContainer.isMonorepo) {
            initGit = false;
            Helpers__NS__info(`Not initing git since ${path.basename(appLocation)} is inside container monorepo`);
        }
        if (HelpersTaon__NS__git__NS__isInsideGitRepo(appLocation)) {
            initGit = false;
            Helpers__NS__info(`Not initing git since ${path.basename(appLocation)} is inside git repo`);
        }
        if (initGit) {
            try {
                appProj.run('git init').sync();
            }
            catch (error) {
                initGit = false;
                console.log(error);
                Helpers__NS__warn(`Not able to init git inside: ${appProj.location}`);
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
                Helpers__NS__warn(`Not add "first" commit inside repository: ${appProj.location}`);
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
            lastContainer.taonJson.setType(LibTypeEnum.CONTAINER);
        }
        await appProj.init(this.params.clone({
            purpose: 'initing new app',
            release: {
                targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
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
                Helpers__NS__warn(`Not able to init git inside: ${appProj.location}`);
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
        Helpers__NS__writeFile([appProj.location, readmeMdMainProject], `# ${appProj.name}

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
            lastContainer.writeFile(readmeMdMainProject, `# @${lastContainer.name}

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
        Helpers__NS__info(`DONE CREATING ${nameFromArgs}`);
        return appProj.name;
    }
}
export default {
    $New: HelpersTaon__NS__CLIWRAP($New, '$New'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-NEW.js.map