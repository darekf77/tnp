"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Framework = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const typescript_1 = require("typescript");
const app_utils_1 = require("../../app-utils");
const constants_1 = require("../../constants");
const options_1 = require("../../options");
//#endregion
// @ts-ignore TODO weird inheritance problem
class Framework extends lib_4.BaseFeatureForProject {
    //#region is unknown npm project
    get isUnknownNpmProject() {
        //#region @backendFunc
        return this.project.typeIs(lib_1.LibTypeEnum.UNKNOWN_NPM_PROJECT);
        //#endregion
    }
    //#endregion
    //#region is tnp
    /**
     * TODO make this more robust
     */
    get isTnp() {
        //#region @backendFunc
        if (this.project.typeIsNot(lib_1.LibTypeEnum.ISOMORPHIC_LIB)) {
            return false;
        }
        return this.project.location === this.project.ins.Tnp.location;
        //#endregion
    }
    //#endregion
    //#region is core project
    /**
     * Core project with basic tested functionality
     */
    get isCoreProject() {
        //#region @backendFunc
        return this.project.taonJson.isCoreProject;
        //#endregion
    }
    //#endregion
    //#region is container or workspace with linked projects
    get isContainerWithLinkedProjects() {
        //#region @backendFunc
        return (this.isContainer && this.project.linkedProjects.linkedProjects.length > 0);
        //#endregion
    }
    //#endregion
    //#region is container
    /**
     * is normal or smart container
     */
    get isContainer() {
        //#region @backendFunc
        return this.project.typeIs(lib_1.LibTypeEnum.CONTAINER);
        //#endregion
    }
    //#endregion
    //#region is container core project
    get isContainerCoreProject() {
        //#region @backendFunc
        return this.isContainer && this.isCoreProject;
        //#endregion
    }
    //#endregion
    //#region is container child
    get isContainerChild() {
        //#region @backendFunc
        return (!!this.project.parent && this.project.parent.typeIs(lib_1.LibTypeEnum.CONTAINER));
        //#endregion
    }
    //#endregion
    //#region is standalone project
    /**
     * Standalone project ready for publish on npm
     * Types of standalone project:
     * - isomorphic-lib : backend/fronded ts library with server,app preview
     * - angular-lib: frontend ui lib with angular preview
     */
    get isStandaloneProject() {
        //#region @backendFunc
        if (this.project.typeIs(lib_1.LibTypeEnum.UNKNOWN)) {
            return false;
        }
        return !this.isContainer && !this.isUnknownNpmProject;
        //#endregion
    }
    //#endregion
    //#region get framework version
    get frameworkVersion() {
        //#region @backendFunc
        return this.project.taonJson.frameworkVersion;
        //#endregion
    }
    //#endregion
    //#region get framework version minus 1
    get frameworkVersionMinusOne() {
        //#region @backendFunc
        const curr = Number(lib_2._.isString(this.frameworkVersion) &&
            this.frameworkVersion.replace('v', ''));
        if (!isNaN(curr) && curr >= 2) {
            return `v${curr - 1}`;
        }
        return 'v1';
        //#endregion
    }
    //#endregion
    //#region framework version equals
    frameworkVersionEquals(version) {
        //#region @backendFunc
        const ver = Number(lib_2._.isString(version) && version.replace('v', ''));
        const curr = Number(lib_2._.isString(this.frameworkVersion) &&
            this.frameworkVersion.replace('v', ''));
        return !isNaN(ver) && !isNaN(curr) && curr === ver;
        //#endregion
    }
    //#endregion
    //#region framework version at least
    frameworkVersionAtLeast(version) {
        //#region @backendFunc
        const ver = Number(lib_2._.isString(version) && version.replace('v', ''));
        const curr = Number(lib_2._.isString(this.frameworkVersion) &&
            this.frameworkVersion.replace('v', ''));
        return !isNaN(ver) && !isNaN(curr) && curr >= ver;
        //#endregion
    }
    //#endregion
    //#region private methods / add missing components/modules
    migrateFromNgModulesToStandaloneV21(tsFileContent) {
        if (this.project.framework.frameworkVersionLessThan('v21')) {
            return tsFileContent;
        }
        return lib_4.UtilsTypescript.migrateFromNgModulesToStandaloneV21(tsFileContent, lib_2._.upperFirst(lib_2._.camelCase(this.project.name)));
    }
    replaceModuleAndComponentName(tsFileContent) {
        //#region @backendFunc
        if (this.project.framework.frameworkVersionAtLeast('v21')) {
            return tsFileContent;
        }
        // Parse the source file using TypeScript API
        const projectName = this.project.name;
        const sourceFile = (0, typescript_1.createSourceFile)('temp.ts', tsFileContent, typescript_1.ScriptTarget.Latest, true);
        let moduleName = null;
        let componentName = null;
        let tooMuchToProcess = false;
        const newComponentName = `${lib_2._.upperFirst(lib_2._.camelCase(projectName))}Component`;
        const newModuleName = `${lib_2._.upperFirst(lib_2._.camelCase(projectName))}Module`;
        let orignalComponentClassName;
        let orignalModuleClassName;
        // Visitor to analyze the AST
        const visit = (node) => {
            if ((0, typescript_1.isClassDeclaration)(node) && node.name) {
                const className = node.name.text;
                if (className.endsWith('Module')) {
                    if (moduleName) {
                        // More than one module found, return original content
                        tooMuchToProcess = true;
                        return;
                    }
                    moduleName = className;
                    orignalModuleClassName = className;
                }
                if (className.endsWith('Component')) {
                    if (componentName) {
                        // More than one component found, return original content
                        tooMuchToProcess = true;
                        return;
                    }
                    componentName = className;
                    orignalComponentClassName = className;
                }
            }
            (0, typescript_1.forEachChild)(node, visit);
        };
        visit(sourceFile);
        if (tooMuchToProcess) {
            return tsFileContent;
        }
        const moduleTempalte = [`\n//#re`, `gion  ${this.project.name} module `].join('') +
            ['\n//#re', 'gion @bro', 'wser'].join('') +
            `\n@NgModule({ declarations: [${newComponentName}],` +
            ` imports: [CommonModule], exports: [${newComponentName}] })\n` +
            `export class ${newModuleName} {}` +
            ['\n//#endre', 'gion'].join('') +
            ['\n//#endre', 'gion'].join('');
        const componentTemplate = [`\n//#re`, `gion  ${this.project.name} component `].join('') +
            ['\n//#re', 'gion @bro', 'wser'].join('') +
            `\n@Component({
      standalone: false,
      template: \`

      hello world fromr ${this.project.name}

      \` })` +
            `\nexport class ${newComponentName} {}` +
            ['\n//#endre', 'gion'].join('') +
            ['\n//#endre', 'gion'].join('');
        if (orignalModuleClassName) {
            tsFileContent = tsFileContent.replace(new RegExp(orignalModuleClassName, 'g'), newModuleName);
            return tsFileContent;
        }
        if (orignalComponentClassName) {
            tsFileContent = tsFileContent.replace(new RegExp(orignalComponentClassName, 'g'), newComponentName);
            return tsFileContent;
        }
        if (moduleName === null && componentName === null) {
            // No module or component found, append new ones
            return (tsFileContent + '\n\n' + componentTemplate + '\n\n' + moduleTempalte);
        }
        if (moduleName === null && componentName !== null) {
            // append only module
            return tsFileContent + '\n\n' + moduleTempalte;
        }
        if (moduleName !== null && componentName === null) {
            // Either module or component is missing; leave content unchanged
            return tsFileContent + '\n\n' + componentTemplate;
        }
        return tsFileContent;
        //#endregion
    }
    //#endregion
    //#region fix core content
    fixCoreContent = (appTsContent) => {
        const project = this.project;
        const coreName = lib_2._.upperFirst(lib_2._.camelCase(project.name));
        const coreNameKebab = lib_2._.kebabCase(project.name);
        return appTsContent
            .replace(new RegExp(`IsomorphicLibV${project.framework.frameworkVersion.replace('v', '')}`, 'g'), `${coreName}`)
            .replace(new RegExp(`isomorphic-lib-v${project.framework.frameworkVersion.replace('v', '')}`, 'g'), `${coreNameKebab}`);
    };
    //#endregion
    //#region recreate vars scss
    recreateVarsScss(initOptions) {
        //#region @backendFunc
        if (!this.project.typeIs(lib_1.LibTypeEnum.ISOMORPHIC_LIB)) {
            return;
        }
        //#region recreate vars.scss file
        // TODO QUICK_FIX this will work in app - only if app is build with same base-href
        this.project.writeFile('src/vars.scss', `${constants_1.THIS_IS_GENERATED_INFO_COMMENT}
  // CORE ASSETS BASENAME - use it only for asset from core container
  $basename: '${(initOptions.build.baseHref?.startsWith('./')
            ? initOptions.build.baseHref.replace('./', '/')
            : initOptions.build.baseHref) || '/'}';
  $website_title: '${initOptions.website.title}';
  $website_domain: '${initOptions.website.domain}';
  $project_npm_name: '${this.project.nameForNpmPackage}';
  ${constants_1.THIS_IS_GENERATED_INFO_COMMENT}
  `);
        //#endregion
        //#endregion
    }
    //#endregion
    //#region prevent not existed component and module in app.ts
    preventNotExistedComponentAndModuleInAppTs() {
        //#region @backendFunc
        const relativeAppTs = (0, lib_2.crossPlatformPath)([constants_1.srcMainProject, constants_1.appTsFromSrc]);
        const appFile = this.project.pathFor(relativeAppTs);
        let contentAppFile = lib_2.Helpers.readFile(appFile);
        let newContentAppFile = contentAppFile;
        if (this.project.framework.frameworkVersionAtLeast('v21')) {
            // newContentAppFile =
            //   this.project.framework.migrateFromNgModulesToStandaloneV21(
            //     contentAppFile,
            //   );
        }
        else {
            newContentAppFile =
                this.project.framework.replaceModuleAndComponentName(contentAppFile);
        }
        lib_2.Helpers.writeFile(appFile, newContentAppFile);
        try {
            this.project.formatFile(relativeAppTs);
        }
        catch (error) { }
        //#endregion
    }
    //#endregion
    //#region recreate from core project
    recreateFileFromCoreProject = (options) => {
        //#region @backendFunc
        let { fileRelativePath, customDestinationLocation, relativePathInCoreProject, forceRecrete, } = options || {};
        customDestinationLocation = (0, lib_2.crossPlatformPath)(customDestinationLocation);
        if (customDestinationLocation &&
            lib_2.Helpers.exists(customDestinationLocation) &&
            lib_2.Helpers.isFolder(customDestinationLocation)) {
            lib_2.Helpers.error(`[${lib_1.config.frameworkName}] Custom destination "${customDestinationLocation}"` +
                ` location cannot be a folder, it must be a file path`);
        }
        const project = this.project;
        fileRelativePath = (0, lib_2.crossPlatformPath)(fileRelativePath);
        if ((lib_2._.isString(fileRelativePath) &&
            (!project.hasFile(fileRelativePath) || forceRecrete)) ||
            customDestinationLocation) {
            const filePathSource = project.framework.coreProject.pathFor(relativePathInCoreProject
                ? relativePathInCoreProject
                : fileRelativePath);
            // console.log({filePathSource})
            const sourceContent = lib_2.Helpers.readFile(filePathSource);
            const fixedContent = this.fixCoreContent(sourceContent);
            if (customDestinationLocation) {
                lib_2.Helpers.writeFile(customDestinationLocation, fixedContent);
            }
            else {
                project.writeFile(fileRelativePath, fixedContent);
            }
        }
        //#endregion
    };
    //#endregion
    //#region framework version less than or equal
    frameworkVersionLessThanOrEqual(version) {
        //#region @backendFunc
        return (this.frameworkVersionEquals(version) ||
            this.frameworkVersionLessThan(version));
        //#endregion
    }
    //#endregion
    //#region framework version less than
    frameworkVersionLessThan(version) {
        //#region @backendFunc
        const ver = Number(lib_2._.isString(version) && version.replace('v', ''));
        const curr = Number(lib_2._.isString(this.frameworkVersion) &&
            this.frameworkVersion.replace('v', ''));
        return !isNaN(ver) && !isNaN(curr) && curr < ver;
        //#endregion
    }
    //#endregion
    //#region core container data from node modules link
    get containerDataFromNodeModulesLink() {
        //#region @backendFunc
        const realpathCCfromCurrentProj = lib_2.fse.existsSync(this.project.nodeModules.path) &&
            lib_2.fse.realpathSync(this.project.nodeModules.path);
        const pathCCfromCurrentProj = realpathCCfromCurrentProj &&
            (0, lib_2.crossPlatformPath)(lib_2.path.dirname(realpathCCfromCurrentProj));
        const coreContainerFromNodeModules = (pathCCfromCurrentProj &&
            this.project.ins.From(pathCCfromCurrentProj));
        const isCoreContainer = coreContainerFromNodeModules &&
            coreContainerFromNodeModules?.framework.isCoreProject &&
            coreContainerFromNodeModules?.framework.isContainer;
        return { isCoreContainer, coreContainerFromNodeModules };
        //#endregion
    }
    //#endregion
    //#region core project
    get coreProject() {
        //#region @backendFunc
        return this.project.ins.by(this.project.type, this.frameworkVersion);
        //#endregion
    }
    //#endregion
    //#region is link to node modules different than core container
    get isLinkToNodeModulesDifferentThanCoreContainer() {
        //#region @backendFunc
        const { isCoreContainer, coreContainerFromNodeModules } = this.containerDataFromNodeModulesLink;
        return (isCoreContainer &&
            coreContainerFromNodeModules.location !==
                this.project.ins.by(lib_1.LibTypeEnum.CONTAINER, this.frameworkVersion)
                    .location);
        //#endregion
    }
    //#endregion
    //#region core container
    /**
     * Get automatic core container for project
     * WHEN NODE_MODULES BELONG TO TNP -> it uses tnp core container
     */
    get coreContainer() {
        //#region @backendFunc
        // use core container from node_modules link first - if it is proper
        // TODO QUICK_FIX FOR 'update-vscode-package-json.js'
        const emptyFrameworkName = !lib_1.config.frameworkName;
        if (lib_1.taonPackageName === lib_1.config.frameworkName || emptyFrameworkName) {
            const { isCoreContainer, coreContainerFromNodeModules } = this.containerDataFromNodeModulesLink;
            if (isCoreContainer) {
                // this.project.nodeModules.reinstallSync();
                return coreContainerFromNodeModules;
            }
        }
        const coreContainer = this.project.ins.by(lib_1.LibTypeEnum.CONTAINER, this.frameworkVersion);
        if (!coreContainer) {
            if (!lib_2.UtilsOs.isRunningInVscodeExtension()) {
                lib_2.Helpers.error(`
        There is something wrong with core ${constants_1.containerPrefix}${this.frameworkVersion}

        You need to sync taon containers. Try command:

      ${lib_1.config.frameworkName} sync

      `, false, true);
            }
            else {
                console.warn(`Not able to find core container for
           project name: ${this.project.nameForNpmPackage}
           location: ${this.project.location}
           type: ${this.project.type}
           config.frameworkName: ${lib_1.config.frameworkName}

           `);
            }
        }
        // TODO I cloud install node_modules here automatically, but sometimes
        // is is not needed
        // coreContainer.nodeModules.reinstallSync();
        return coreContainer;
        //#endregion
    }
    //#endregion
    //#region tmp local project full path
    get tmpLocalProjectFullPath() {
        return this.project.pathFor([
            constants_1.tmpLocalCopytoProjDist,
            constants_1.nodeModulesMainProject,
            this.project.nameForNpmPackage,
        ]);
    }
    //#endregion
    //#region generate index.ts
    resolveAbsPath(relativePath) {
        //#region @backendFunc
        if (!relativePath || relativePath === '') {
            return this.project.location;
        }
        if (lib_2.path.isAbsolute(relativePath)) {
            return relativePath;
        }
        return this.project.pathFor(relativePath);
        //#endregion
    }
    generateIndexTs(relativePath = '') {
        //#region @backendFunc
        const absPath = this.resolveAbsPath(relativePath);
        // const absPath = path.isAbsolute(relativePath)
        //   ? relativePath
        //   : relativePath
        //   ? this.project.pathFor(relativePath)
        //   : this.project.location;
        const folders = [
            ...lib_2.Helpers.foldersFrom(absPath).map(f => lib_2.path.basename(f)),
            ...lib_2.Helpers.filesFrom(absPath, false).map(f => lib_2.path.basename(f)),
        ]
            .filter(f => ![lib_3.fileName.index_ts].includes(f))
            .filter(f => !f.startsWith('.'))
            .filter(f => !f.startsWith('_'))
            .filter(f => lib_2._.isUndefined(lib_1.notNeededForExportFiles.find(e => f.endsWith(e))))
            .filter(f => lib_2.path.extname(f) === '' ||
            !lib_2._.isUndefined(lib_1.extAllowedToExportAndReplaceTSJSCodeFiles.find(a => f.endsWith(a))));
        lib_2.Helpers.writeFile((0, lib_2.crossPlatformPath)([absPath, lib_3.fileName.index_ts]), folders
            .map(f => {
            if (!lib_2._.isUndefined(lib_1.frontendFiles.find(bigExt => f.endsWith(bigExt)))) {
                // `${TAGS.COMMENT_REGION} ${TAGS.BROWSER}\n` +
                return `export * from './${f.replace(lib_2.path.extname(f), '')}'; // ${lib_1.TAGS.BROWSER}`;
                // +`\n${TAGS.COMMENT_END_REGION}\n`;
            }
            if (!lib_2._.isUndefined(lib_1.backendNodejsOnlyFiles.find(bigExt => f.endsWith(bigExt)))) {
                return (
                // `${TAGS.COMMENT_REGION} ${TAGS.BACKEND}\n` +
                `export * from './${f.replace(lib_2.path.extname(f), '')}'; // ${lib_1.TAGS.BACKEND}`
                // +`\n${TAGS.COMMENT_END_REGION}\n`
                );
            }
            return `export * from './${f.replace(lib_2.path.extname(f), '')}';`;
        })
            .join('\n') + '\n');
        //#endregion
    }
    //#endregion
    //#region global
    async global(globalPackageName, packageOnly = false) {
        //#region @backendFunc
        const oldContainer = this.project.ins.by(lib_1.LibTypeEnum.CONTAINER, 'v1');
        if (oldContainer.nodeModules.empty) {
            lib_2.Helpers.info('initing container v1 for global packages');
            await oldContainer.init(options_1.EnvOptions.from({
                purpose: 'old container init',
            }));
        }
        if (packageOnly) {
            return (0, lib_2.crossPlatformPath)(lib_2.path.join(oldContainer.nodeModules.path, globalPackageName));
        }
        return (0, lib_2.crossPlatformPath)(lib_2.path.join(oldContainer.nodeModules.path, globalPackageName, `bin/${globalPackageName}`));
        //#endregion
    }
    //#endregion
    //#region detected contexts
    /**
     * @returns by default it will always return at least one context
     */
    getAllDetectedContextsNames() {
        return this.getAllDetectedTaonContexts()
            .map((f, i) => (f?.contextName || `UnnamedContext${i}`)
            .replace('.sqlite', '')
            .replace('db-', ''))
            .sort((a, b) => a.localeCompare(b));
    }
    /**
     * @returns by default it will always return at least one context
     */
    getAllDetectedTaonContexts(options) {
        options = options || {};
        const detectedContexts = [...this._allDetectedNestedContexts(options)];
        return detectedContexts.sort((a, b) => {
            const keyA = `${a.fileRelativePath}#${a.contextName}`.toLowerCase();
            const keyB = `${b.fileRelativePath}#${b.contextName}`.toLowerCase();
            return keyA.localeCompare(keyB);
        });
    }
    contextFilter(relativePath) {
        return (relativePath === constants_1.appTsFromSrc ||
            relativePath === constants_1.migrationIndexAutogeneratedTsFileRelativeToSrcPath ||
            relativePath.endsWith(constants_1.TaonFileExtension.DOT_WORKER_TS) ||
            relativePath.endsWith(constants_1.TaonFileExtension.DOT_CONTEXT_TS));
    }
    _allDetectedNestedContexts(options) {
        //#region @backendFunc
        options = options || {};
        const basePath = this.project.pathFor([constants_1.srcMainProject]);
        const notAllowedFolders = [...(options.skipLibFolder ? [constants_1.libFromSrc] : [])];
        const filesForContext = lib_2.Helpers.getFilesFrom(basePath, {
            recursive: true,
        }).filter(absPath => {
            const relativePath = absPath.replace(`${basePath}/`, '');
            if (notAllowedFolders.find(f => relativePath.startsWith(`${f}/`))) {
                return false;
            }
            return this.contextFilter(relativePath);
        });
        const detectedDatabaseFiles = filesForContext.reduce((a, absPathToFile) => {
            return a.concat(lib_4.UtilsTypescript.getTaonContextsNamesFromFile(absPathToFile).map(contextName => {
                return {
                    contextName: contextName,
                    fileRelativePath: absPathToFile.replace(`${basePath}/`, ''),
                };
            }));
        }, []);
        return detectedDatabaseFiles;
        //#endregion
    }
    //#endregion
    //#region get all external isomorphic dependencies for npm lib
    get allDetectedExternalIsomorphicDependenciesForNpmLibCode() {
        //#region @backendFunc
        const allFiles = lib_2.Helpers.getFilesFrom(this.project.pathFor([constants_1.srcMainProject, constants_1.libFromSrc]), {
            recursive: true,
            followSymlinks: false,
        }).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
        const allImports = [];
        for (const fileAbsPath of allFiles) {
            const imports = lib_4.UtilsTypescript.recognizeImportsFromFile(fileAbsPath);
            allImports.push(...imports);
        }
        const isomorphicLibs = this.project.nodeModules.getIsomorphicPackagesNames();
        // const taonCoreImports = Object.keys(
        //   this.project.framework.coreProject.packageJson.allDependencies,
        // ).filter(f => !isomorphicLibs.includes(f));
        const displayList = lib_2.Utils.uniqArray(allImports
            .filter(f => f.type === 'import' ||
            f.type === 'require' ||
            f.type === 'async-import')
            .map(i => `${i.cleanEmbeddedPathToFile}`)
            .filter(i => !i.startsWith('.') &&
            isomorphicLibs.includes(i.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${constants_1.srcFromTaonImport}`) + '$'), '')))
            .map(i => i.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${constants_1.srcFromTaonImport}`) + '$'), ''))).sort();
        return displayList;
        //#endregion
    }
    //#endregion
    //#region get all external isomorphic dependencies for npm lib
    get allDetectedExternalNPmDependenciesForNpmLibCode() {
        //#region @backendFunc
        const allFiles = lib_2.Helpers.getFilesFrom(this.project.pathFor([constants_1.srcMainProject, constants_1.libFromSrc]), {
            recursive: true,
            followSymlinks: false,
        }).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
        const allImports = [];
        for (const fileAbsPath of allFiles) {
            const imports = lib_4.UtilsTypescript.recognizeImportsFromFile(fileAbsPath);
            allImports.push(...imports);
        }
        let displayList = lib_2.Utils.uniqArray(allImports
            .filter(f => f.type === 'import' ||
            f.type === 'require' ||
            f.type === 'async-import')
            .map(i => `${i.cleanEmbeddedPathToFile}`)
            .filter(i => !i.startsWith('.'))
            .map(i => i.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${constants_1.srcFromTaonImport}`) + '$'), ''))).sort();
        const allIsomorphicDeps = this.project.nodeModules.getIsomorphicPackagesNames();
        displayList = displayList.filter(d => !allIsomorphicDeps.includes(d));
        displayList = displayList.filter(d => !this.NODE_BUILTIN_MODULES.includes(d));
        return displayList;
        //#endregion
    }
    //#endregion
    //#region recreate app ts presentation
    recreateAppTsPresentationFiles() {
        //#region @backendFunc
        lib_2.Helpers.info(`RECREATING app.ts presentation app.auto-gen* files`);
        let content = this.project.readFile([constants_1.srcMainProject, constants_1.appTsFromSrc]);
        this.project.writeFile([constants_1.srcMainProject, constants_1.appAutoGenDocsMd], `App **${this.project.nameForNpmPackage}**\n\n${this.project.taonJson.overridePackageJsonManager.description ||
            '- no description for project.. use taon.jsonc[packageJsonOverride.description] -'}:\n\n
${(0, app_utils_1.extractFirstLevelRegions)(content)
            .map(c => {
            return `<details>\n<summary>${c.regionName}</summary>\n\n\`\`\`ts\n${c.regionContent}\n\`\`\`\n\n</details>\n\n`;
        })
            .join('\n')}

`);
        content = content
            .replace(/\`/g, '\\`')
            .replace(/\$/g, '\\$')
            .replace(/\@/g, `\${'@'}`)
            .replace(new RegExp(lib_2.Utils.escapeStringForRegEx('#' + 'reg' + 'ion'), 'g'), `#\${'reg'+'ion'}`)
            .replace(new RegExp(lib_2.Utils.escapeStringForRegEx('#' + 'end' + 'reg' + 'ion'), 'g'), `#\${'end'+'reg'+'ion'}`);
        this.project.writeFile([constants_1.srcMainProject, constants_1.appAutoGenJs], ` // This files is autogenerated and content is ready to be consumed in js.
export const AppTs${lib_2._.camelCase(this.project.nameForNpmPackage)} = \`${content}\`;
export default AppTs${lib_2._.camelCase(this.project.nameForNpmPackage)};`);
        //#endregion
    }
    //#endregion
    //#region node modules building array
    NODE_BUILTIN_MODULES = [
        'node:child_process',
        'node:crypto',
        'node:fs',
        'node:fs/promises',
        'node:path',
        'node:url',
        'node:util',
        // --- File system & paths ---
        'fs',
        'fs/promises',
        'path',
        // --- Networking ---
        'net',
        'tls',
        'dgram',
        'http',
        'http2',
        'https',
        // --- Streams & buffers ---
        'stream',
        'stream/promises',
        'stream/consumers',
        'buffer',
        // --- Process & OS ---
        'process',
        'os',
        'worker_threads',
        'cluster',
        // --- Timers & async ---
        'timers',
        'timers/promises',
        'async_hooks',
        // --- Crypto & security ---
        'crypto',
        'zlib',
        // --- Utilities ---
        'util',
        'util/types',
        'assert',
        'assert/strict',
        // --- URL & encoding ---
        'url',
        'querystring',
        'punycode',
        // --- VM / internals ---
        'vm',
        'v8',
        'perf_hooks',
        'diagnostics_channel',
        // --- Modules & loaders ---
        'module',
        // --- REPL / CLI ---
        'repl',
        'readline',
        'readline/promises',
        // --- Child processes ---
        'child_process',
        // --- DNS ---
        'dns',
        'dns/promises',
        // --- Inspector / debugging ---
        'inspector',
        // --- Intl / Web ---
        'intl',
        'webcrypto',
        // --- WASI ---
        'wasi',
        // --- Node-specific helpers ---
        'events',
        'constants',
        'domain',
    ];
    //#endregion
    //#region set framewor version
    async setFrameworkVersion(newFrameworkVersion, options) {
        //#region @backendFunc
        if (!newFrameworkVersion || !newFrameworkVersion.startsWith('v')) {
            lib_2.Helpers.error(`Invalid framework version: ${newFrameworkVersion}`, false, true);
        }
        const rawNumber = Number(newFrameworkVersion.replace('v', ''));
        if (isNaN(rawNumber) || rawNumber < 1) {
            lib_2.Helpers.error(`Invalid framework version: ${newFrameworkVersion}`, false, true);
        }
        options = options || {};
        lib_2.Helpers.info(`Setting framework version (${newFrameworkVersion}) for ${this.project.name}... and children`);
        const confirm = !options.confirm
            ? true
            : await lib_1.UtilsTerminal.confirm({
                message: `Are you sure you want to set framework version to ${newFrameworkVersion} for project ${this.project.name} and all its children ?`,
                defaultValue: false,
            });
        if (!confirm) {
            lib_2.Helpers.warn(`Operation cancelled by user.`);
            return;
        }
        await this.project.taonJson.setFrameworkVersion(newFrameworkVersion);
        for (const child of this.project.children) {
            await child.taonJson.setFrameworkVersion(newFrameworkVersion);
        }
        lib_2.Helpers.taskDone(`Framework version set to ${newFrameworkVersion}`);
        //#endregion
    }
    //#endregion
    //#region set npm version
    async setNpmVersion(npmVersion, options) {
        //#region @backendFunc
        if (!lib_4.UtilsNpm.isProperVersion(npmVersion)) {
            lib_2.Helpers.error(`Invalid npm version: ${npmVersion}`, false, true);
        }
        options = options || {};
        lib_2.Helpers.info(`Setting npm version (${npmVersion}) for ${this.project.name}... and children`);
        const confirm = !options.confirm
            ? true
            : await lib_1.UtilsTerminal.confirm({
                message: `Are you sure you want to set npm version to ${npmVersion} for project ${this.project.name} and all its children ?`,
                defaultValue: false,
            });
        if (!confirm) {
            lib_2.Helpers.warn(`Operation cancelled by user.`);
            return;
        }
        await this.project.packageJson.setVersion(npmVersion);
        for (const child of this.project.children) {
            await child.packageJson.setVersion(npmVersion);
        }
        //#endregion
    }
    //#endregion
    //#region generate lib index
    async generateLibIndex() {
        //#region @backendFunc
        this.project.taonJson.setShouldGenerateAutogenIndexFile(true);
        await this.project.artifactsManager.artifact.npmLibAndCliTool.indexAutogenProvider.runTask({
            watch: false,
        });
        await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask({
            watch: false,
        });
        lib_2.Helpers.info(`Library index.ts regenerated`);
        //#endregion
    }
    //#endregion
    //#region generate app routes
    async generateAppRoutes() {
        //#region @backendFunc
        this.project.taonJson.setShouldGenerateAutogenAppRoutes(true);
        await this.project.artifactsManager.artifact.npmLibAndCliTool.appTsRoutesAutogenProvider.runTask();
        //#endregion
    }
    //#endregion
    filterVerfiedBuilds(packagesNames) {
        return packagesNames.filter(f => {
            const pathToVerifyFile = this.project.nodeModules.pathFor([
                f,
                constants_1.VERIFIED_BUILD_DATA,
            ]);
            // console.log({ pathToVerifyFile });
            return !lib_2.Helpers.readJsonC(pathToVerifyFile, {})
                ?.commitHash;
        });
    }
    get notVerifiedIsomorphicPackagesBuildsInNodeModules() {
        return this.filterVerfiedBuilds(this.project.framework.coreContainer.nodeModules.getIsomorphicPackagesNames());
    }
}
exports.Framework = Framework;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/framework.js.map