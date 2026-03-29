"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Docs = void 0;
const lib_1 = require("magic-renamer/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-core/lib");
const lib_6 = require("tnp-core/lib");
const lib_7 = require("tnp-core/lib");
const lib_8 = require("tnp-core/lib");
const lib_9 = require("tnp-helpers/lib");
const lib_10 = require("tnp-helpers/lib");
const lib_11 = require("tnp-helpers/lib");
const constants_1 = require("../../../../constants");
//#endregion
class Docs extends lib_10.BaseDebounceCompilerForProject {
    //#region fields & getters
    envOptions;
    mkdocsServePort;
    linkedAlreadProjects = {};
    //#region fields & getters / docs config current proj abs path
    get docsConfigCurrentProjAbsPath() {
        //#region @backendFunc
        return this.project.pathFor(constants_1.docsConfigJsonFileName);
        //#endregion
    }
    //#endregion
    //#region fields & getters / docs config
    get config() {
        //#region @backendFunc
        return this.project.readJson(constants_1.docsConfigJsonFileName);
        //#endregion
    }
    //#endregion
    //#region fields & getters / linkd docs to global container
    linkDocsToGlobalContainer() {
        //#region @backendFunc
        if (!lib_11.Helpers.exists(lib_4.path.dirname(this.docsConfigGlobalContainerAbsPath))) {
            lib_11.Helpers.mkdirp(lib_4.path.dirname(this.docsConfigGlobalContainerAbsPath));
        }
        try {
            lib_3.fse.unlinkSync(this.docsConfigGlobalContainerAbsPath);
        }
        catch (error) { }
        lib_11.Helpers.createSymLink(this.project.pathFor(this.tmpDocsFolderRootDocsDirRelativePath), this.docsConfigGlobalContainerAbsPath);
        this.writeGlobalWatcherTimestamp();
        //#endregion
    }
    //#endregion
    //#region fields & getters / tmp docs folder path
    /**
     * mkdocs temp folder
     */
    tmpDocsFolderRoot = `.${lib_2.config.frameworkName}/temp-docs-folder`;
    /**
     * Example:
     * .taon/temp-docs-folder/allmdfiles
     */
    get tmpDocsFolderRootDocsDirRelativePath() {
        //#region @backendFunc
        return (0, lib_4.crossPlatformPath)([
            this.tmpDocsFolderRoot,
            constants_1.combinedDocsAllMdFilesFolder,
        ]);
        //#endregion
    }
    //#endregion
    //#region fields & getters / out docs folder path
    get outDocsDistFolderAbs() {
        //#region @backendFunc
        return this.project.pathFor([
            this.initialParams.docsOutFolder || `.${lib_2.config.frameworkName}/docs-dist`,
        ]);
        //#endregion
    }
    //#endregion
    //#region n fields & getters / docs config global container abs path
    get docsConfigGlobalContainerAbsPath() {
        //#region @backendFunc
        const globalContainer = this.project.ins.by(lib_2.LibTypeEnum.CONTAINER, this.project.framework.frameworkVersion);
        return globalContainer.pathFor(`.${lib_2.config.frameworkName}/docs-from-projects/${this.project.nameForNpmPackage}`);
        //#endregion
    }
    //#endregion
    //#region fields & getters / docs global timestamp for watcher abs path
    get docsGlobalTimestampForWatcherAbsPath() {
        //#region @backendFunc
        return this.getTimestampWatcherForPackageName(this.project.nameForNpmPackage);
        //#endregion
    }
    //#endregion
    //#region n fields & getters / docs config schema path
    get docsConfigSchemaPath() {
        //#region @backendFunc
        return this.project.ins
            .by(lib_2.LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
            .pathFor(constants_1.docsConfigSchema);
        //#endregion
    }
    //#endregion
    //#endregion
    //#region methods / init
    async init() {
        //#region @backendFunc
        this.project.removeFolderByRelativePath(this.tmpDocsFolderRootDocsDirRelativePath);
        this.project.createFolder(this.tmpDocsFolderRootDocsDirRelativePath);
        if (!this.project.hasFile(constants_1.docsConfigJsonFileName)) {
            this.project.writeJson(constants_1.docsConfigJsonFileName, this.defaultDocsConfig());
        }
        if (!this.project.framework.isCoreProject) {
            try {
                lib_3.fse.unlinkSync(this.project.pathFor(constants_1.docsConfigSchema));
            }
            catch (error) { }
            if (lib_11.Helpers.exists(this.docsConfigSchemaPath)) {
                // TODO @LAST GENERATE DOCS CONFIG SCHAMA IN CORE PROJECTS
                lib_11.Helpers.createSymLink(this.docsConfigSchemaPath, this.project.pathFor(constants_1.docsConfigSchema), { continueWhenExistedFolderDoesntExists: true });
            }
        }
        this.linkDocsToGlobalContainer();
        //#endregion
    }
    //#endregion
    //#region methods / initialize watchers
    initializeWatchers(envOptions) {
        this.envOptions = envOptions;
        const project = this.project;
        this.initOptions({
            taskName: `DocsProviderFor${lib_4._.upperFirst(lib_4._.camelCase(this.project.location))}`,
            folderPath: project.location,
            ignoreFolderPatter: [
                project.pathFor('tmp-*/**'),
                project.pathFor('tmp-*'),
                project.pathFor(`${constants_1.distMainProject}/**`),
                project.pathFor(constants_1.distMainProject),
                project.pathFor(`${constants_1.distMainProject}-*/**`),
                project.pathFor(`${constants_1.browserMainProject}/**`),
                project.pathFor(constants_1.browserMainProject),
                project.pathFor(`${constants_1.websqlMainProject}/**`),
                project.pathFor(constants_1.websqlMainProject),
                project.pathFor(`${constants_1.projectsFromMainProject}/**`),
                project.pathFor(constants_1.projectsFromMainProject),
                project.pathFor(`${lib_8.dotTaonFolder}/**`),
                project.pathFor(lib_8.dotTaonFolder),
                project.pathFor(`${lib_8.dotTnpFolder}/**`),
                project.pathFor(lib_8.dotTnpFolder),
                ...['ts', 'tsx', 'scss', 'html'].map(ext => project.pathFor(`${constants_1.srcMainProject}/**/*.${ext}`)),
                // TODO I may include in feature for example .ts files in md files with handlebars
            ],
            subscribeOnlyFor: ['md', 'yml', 'jpg', 'png', 'gif', 'svg'],
        });
    }
    //#endregion
    //#region methods / action
    async action({ changeOfFiles, asyncEvent, }) {
        //#region @backendFunc
        // if (asyncEvent) {
        //   console.log(
        //     'changeOfFiles',
        //     changeOfFiles.map(f => f.fileAbsolutePath),
        //   );
        // }
        // QUICK_FIX
        if (asyncEvent &&
            changeOfFiles.length === 1 &&
            lib_4._.first(changeOfFiles)?.fileAbsolutePath ===
                this.docsGlobalTimestampForWatcherAbsPath) {
            return;
        }
        if (!asyncEvent) {
            await this.init();
        }
        await this.recreateFilesInTempFolder(asyncEvent);
        if (!asyncEvent) {
            await this.buildMkdocs({ watch: this.isWatchCompilation });
            lib_3.chokidar
                .watch(this.project.pathFor(constants_1.docsConfigJsonFileName), {
                ignoreInitial: true,
            })
                .on('all', async () => {
                lib_11.Helpers.info('Docs config changed (docs-config.jsonc).. rebuilding..');
                await this.action({
                    changeOfFiles: [],
                    asyncEvent: true,
                });
            });
            lib_11.Helpers.info(`${this.isWatchCompilation ? 'Watch' : 'Normal'} docs build done` +
                `${this.isWatchCompilation ? '. Watching..' : '.'}`);
        }
        if (asyncEvent) {
            this.writeGlobalWatcherTimestamp();
        }
        //#endregion
    }
    //#endregion
    //#region methods / docs config json $schema content
    docsConfigSchemaContent() {
        //#region @backendFunc
        return lib_11.Helpers.readFile(this.docsConfigSchemaPath);
        //#endregion
    }
    //#endregion
    //#region private methods
    //#region private methods / default docs config
    defaultDocsConfig() {
        //#region @backendFunc
        return {
            site_name: this.project.name,
            // additionalAssets: [], // TODO MAKE IT AUTOMATIC
            externalDocs: {
                mdfiles: [],
                projects: [],
            },
            omitFilesPatters: [],
            priorityOrder: [],
            mapTitlesNames: {
                'README.md': 'Introduction',
            },
            customCssPath: 'custom.css',
            customJsPath: 'custom.js',
        };
        //#endregion
    }
    //#endregion
    //#region private methods / apply priority order
    applyPriorityOrder(files) {
        //#region @backendFunc
        const orderByPriority = (items, priority) => {
            return items.sort((a, b) => {
                // Get the index of the 'title' in the priorityOrder array
                const indexA = priority.indexOf(a.title.replace('.md', ''));
                const indexB = priority.indexOf(b.title.replace('.md', ''));
                // If either title is not in the priority order, move it to the end (assign a large index)
                const priorityA = indexA === -1 ? priority.length : indexA;
                const priorityB = indexB === -1 ? priority.length : indexB;
                // Compare by priority order
                return priorityA - priorityB;
            });
        };
        files = orderByPriority(files, (this.config.priorityOrder || []).map(p => p.replace('.md', '')));
        // Return prioritized files first, followed by the rest
        const omitFilesPatters = this.config.omitFilesPatters || [];
        const result = lib_3.Utils.uniqArray(
        // [...prioritizedFiles, ...nonPrioritizedFiles]
        files.filter(f => f.title &&
            !omitFilesPatters
                .map(a => a.replace('.md', ''))
                .includes(f.title.replace('.md', ''))), 'relativePath');
        return result;
        //#endregion
    }
    //#endregion
    //#region private methods / mkdocs.yml content
    mkdocsYmlContent(entryPointFilesRelativePaths) {
        //#region @backendFunc
        // console.log({
        //   entryPointFilesRelativePaths,
        // });
        // example:
        // - Introduction: introduction/index.md
        // - Setup: setup/index.md
        // - Isomorphic Code: isomorphic-code/index.md
        // - Development: development/index.md
        // - Tutorials: tutorials/index.md
        // - Changelog: changelog/index.md
        // - QA: qa/index.md
        // docs_dir: ./
        return `site_name: ${this.config.site_name
            ? this.config.site_name
            : lib_4._.upperFirst(this.project.name) + 'Documentation'}
# site_url:  ${this.envOptions.website.domain}
nav:
${this.applyPriorityOrder(entryPointFilesRelativePaths)
            .map(p => {
            if (p.relativePath === p.title) {
                `  - ${lib_4._.replace(p.title, /[_\s]/g, ' ')}`;
            }
            return `  - ${lib_4._.replace(p.title, /[_\s]/g, ' ')}: ${p.relativePath}`;
        })
            .join('\n')}
docs_dir: ./${constants_1.combinedDocsAllMdFilesFolder}
theme:
  name: material
  features:
    - navigation.tabs
    - navigation.sections
    - toc.integrate
    - navigation.top
    - search.suggest
    - search.highlight
    - content.tabs.link
    - content.code.annotation
    - content.code.copy
  language: en
  palette:
    primary: custom
    accent: custom
    # - scheme: default
    #   toggle:
    #     icon: material/toggle-switch-off-outline
    #     name: Switch to dark mode
    # primary: red
    # accent: red
    # - scheme: slate
    #   toggle:
    #     icon: material/toggle-switch
    #     name: Switch to light mode
    # primary: red
    # accent: red

extra_css:
  - ${this.config.customCssPath || constants_1.customDefaultCss}

extra_javascript:
  - ${this.config.customJsPath || constants_1.customDefaultJs}

# plugins:
#   - social

# extra:
#   social:
#     - icon: fontawesome/brands/github-alt
#       link: https://github.com/james-willett
#     - icon: fontawesome/brands/twitter
#       link: https://twitter.com/TheJamesWillett
#     - icon: fontawesome/brands/linkedin
#       link: https://www.linkedin.com/in/willettjames/

markdown_extensions:
  - pymdownx.highlight:
      anchor_linenums: true
  - pymdownx.inlinehilite
  - pymdownx.snippets
  - admonition
  - pymdownx.arithmatex:
      generic: true
  - footnotes
  - pymdownx.details
  - pymdownx.superfences
  - pymdownx.mark
  - attr_list
  # - pymdownx.emoji:
  #     emoji_index: !!python/name:materialx.emoji.twemoji
  #     emoji_generator: !!python/name:materialx.emoji.to_svg

  `;
        //#endregion
    }
    //#endregion
    async validateEnvironemntForMkdocsBuild() {
        //#region @backendFunc
        const pythonExists = await lib_5.UtilsOs.commandExistsAsync('python3');
        if (!pythonExists) {
            lib_11.Helpers.error(`Python3 is not installed.
        Please install Python3 to build mkdocs documentation.`, true, true);
            return false;
        }
        let mkdocsExists = await lib_5.UtilsOs.pythonModuleExists('mkdocs');
        if (!mkdocsExists) {
            lib_11.Helpers.logWarn(`Mkdocs module not found in python3 environment. Checking pipx..`);
            mkdocsExists = await lib_5.UtilsOs.pipxPackageExists('mkdocs');
            if (!mkdocsExists) {
                lib_11.Helpers.error(`Mkdocs is not installed in your Python3 environment.
          Please install mkdocs module.`, true, true);
                return false;
            }
        }
        return true;
        //#region TODO checking mkdocs-material cross platform
        // let mkdocsMaterialExists =
        //   await UtilsOs.pythonModuleExists('mkdocs-material');
        // if (!mkdocsMaterialExists) {
        //   Helpers.logWarn(
        //     `Mkdocs Material theme module not found in python3 environment. Checking pipx..`,
        //   );
        //   mkdocsMaterialExists = await UtilsOs.pipxPackageExists('mkdocs-material');
        //   if (!mkdocsMaterialExists) {
        //     Helpers.logWarn(
        //       `Mkdocs Material not found in pipx mkdocs package. Checking nested mkdocs..`,
        //     );
        //     mkdocsMaterialExists = await UtilsOs.pipxNestedPackageExists(
        //       'mkdocs',
        //       'mkdocs-material',
        //     );
        //   }
        //   if (!mkdocsMaterialExists) {
        //     Helpers.error(
        //       `Mkdocs Material theme is not installed in your Python3 environment.
        //       Please install mkdocs-material module.`,
        //       true,
        //       true,
        //     );
        //     return false;
        //   }
        // }
        // return true;
        //#endregion
        //#endregion
    }
    //#region private methods / build mkdocs
    async buildMkdocs({ watch }) {
        //#region @backendFunc
        const isEnvValid = await this.validateEnvironemntForMkdocsBuild();
        if (!isEnvValid) {
            lib_11.Helpers.error(`Cannot build mkdocs documentation. `, true, true);
            process.exit(1);
        }
        if (watch) {
            this.mkdocsServePort = await this.project.registerAndAssignPort('mkdocs serve', {
                startFrom: 3900,
            });
            await lib_11.Helpers.killOnPort(this.mkdocsServePort);
            const quiet = true;
            const serveCommand = process.platform !== 'win32'
                ? `mkdocs serve -a localhost:${this.mkdocsServePort} ${quiet ? '--quiet' : ''}`
                : //--quiet
                    `python3 -m mkdocs serve -a localhost:${this.mkdocsServePort} ${quiet ? '--quiet' : ''}`;
            // console.log({
            //   serveCommand,
            // });
            lib_11.Helpers.run(serveCommand, {
                cwd: this.project.pathFor([this.tmpDocsFolderRoot]),
            }).async();
            lib_11.Helpers.info(lib_3.chalk.bold(`Mkdocs server started on  http://localhost:${this.mkdocsServePort}
         Serving docs from temp folder: ${this.tmpDocsFolderRoot}
        `));
        }
        else {
            if (!lib_11.Helpers.exists(this.outDocsDistFolderAbs)) {
                lib_11.Helpers.mkdirp(this.outDocsDistFolderAbs);
            }
            lib_11.Helpers.run(process.platform !== 'win32'
                ? `mkdocs build --site-dir ${this.outDocsDistFolderAbs}`
                : //
                    `python3 -m mkdocs build --site-dir ${this.outDocsDistFolderAbs}`, {
                cwd: this.project.pathFor([this.tmpDocsFolderRoot]),
            }).sync();
        }
        //#endregion
    }
    //#endregion
    // TODO @LAST hande @render tag in md files
    //#region private methods / copy files to docs folder
    copyFilesToTempDocsFolder(relativeFilePathesToCopy, asyncEvent) {
        //#region @backendFunc
        let counterCopy = 0;
        //#region handle custom js/css files
        lib_11.Helpers.info(`Handling custom js/css custom files..
      css: ${this.config.customCssPath || constants_1.customDefaultCss}
      js: ${this.config.customJsPath || constants_1.customDefaultJs}
      `);
        if (this.config.customCssPath &&
            this.project.hasFile(this.config.customCssPath)) {
            lib_9.HelpersTaon.copyFile(this.project.pathFor(this.config.customCssPath), this.project.pathFor([
                this.tmpDocsFolderRootDocsDirRelativePath,
                this.config.customCssPath,
            ]));
        }
        else {
            this.project.writeFile([this.tmpDocsFolderRootDocsDirRelativePath, constants_1.customDefaultCss], '');
        }
        if (this.config.customJsPath &&
            this.project.hasFile(this.config.customJsPath)) {
            lib_9.HelpersTaon.copyFile(this.project.pathFor(this.config.customJsPath), this.project.pathFor([
                this.tmpDocsFolderRootDocsDirRelativePath,
                this.config.customJsPath,
            ]));
        }
        else {
            this.project.writeFile([this.tmpDocsFolderRootDocsDirRelativePath, constants_1.customDefaultJs], '');
        }
        //#endregion
        for (const asbFileSourcePath of relativeFilePathesToCopy) {
            if (lib_11.Helpers.isFolder(asbFileSourcePath) ||
                lib_11.Helpers.isSymlinkFileExitedOrUnexisted(asbFileSourcePath)) {
                continue;
            }
            const relativeFileSourcePath = this.project.relative(asbFileSourcePath);
            // console.log(
            //   `(${asyncEvent ? 'async' : 'sync'}) Files changed:`,
            //   relativeFileSourcePath,
            // );
            const isNotInRootMdFile = lib_4.path.basename(asbFileSourcePath) !== relativeFileSourcePath;
            if (isNotInRootMdFile) {
                // console.info('repalcign...');
                const contentWithReplacedSomeLinks = lib_9.UtilsMd.moveAssetsPathsToLevelFromFile(asbFileSourcePath);
                // console.info('repalcign done...');
                lib_7.UtilsFilesFoldersSync.writeFile(this.project.pathFor([
                    this.tmpDocsFolderRootDocsDirRelativePath,
                    relativeFileSourcePath,
                ]), contentWithReplacedSomeLinks, {
                    writeImagesWithoutEncodingUtf8: true,
                });
            }
            else {
                lib_9.HelpersTaon.copyFile(asbFileSourcePath, this.project.pathFor([
                    this.tmpDocsFolderRootDocsDirRelativePath,
                    relativeFileSourcePath,
                ]));
            }
            counterCopy++;
            const assetsFromMdFile = lib_9.UtilsMd.getAssetsFromFile(asbFileSourcePath);
            // if (path.basename(asbFilePath) === 'QA.md') {
            // console.log(`assets for ${relativeFileSourcePath}`, assetsFromMdFile);
            // }
            // TODO add assets to watching list
            for (const assetRelativePathFromFile of assetsFromMdFile) {
                const hasSlash = relativeFileSourcePath.includes('/');
                const slash = hasSlash ? '/' : '';
                const relativeAssetPath = relativeFileSourcePath.replace(slash + lib_4.path.basename(relativeFileSourcePath), slash + assetRelativePathFromFile);
                if (lib_6.UtilsStringRegex.containsNonAscii(relativeAssetPath)) {
                    // console.log({
                    //   assetRelativePathFromFile,
                    //   relativeAssetPath,
                    // })
                    lib_11.Helpers.warn(`Omitting file with non-ascii characters in path: ${relativeAssetPath}`);
                    continue;
                }
                const assetSourcetAbsPath = this.project.pathFor(relativeAssetPath);
                const assetDestLocationAbsPath = this.project.pathFor([
                    this.tmpDocsFolderRootDocsDirRelativePath,
                    relativeAssetPath,
                ]);
                // console.log({
                //   assetRelativePathFromFile,
                //   relativeAssetPath,
                //   relativeFileSourcePath,
                //   assetDestAbsPath: assetSourcetAbsPath,
                //   assetDestLocationAbsPath,
                // });
                console.log(`Copy asset
          "${assetRelativePathFromFile}"
          "${lib_3.chalk.bold(relativeAssetPath)}"
          to "${assetDestLocationAbsPath}"
          `);
                lib_9.HelpersTaon.copyFile(assetSourcetAbsPath, assetDestLocationAbsPath);
                counterCopy++;
            }
        }
        const asyncInfo = asyncEvent
            ? `\nRefreshing http://localhost:${this.mkdocsServePort}..`
            : '';
        lib_11.Helpers.info(`(${asyncEvent ? 'async' : 'sync'}) [${lib_3.Utils.fullDateTime()}] Copied ${counterCopy} ` +
            `files to temp docs folder. ${asyncInfo}`);
        //#endregion
    }
    //#endregion
    //#region private methods / get root files
    async getRootFiles() {
        //#region @backendFunc
        return [
            ...lib_11.Helpers.getFilesFrom(this.project.location, {
                recursive: false,
            })
                .filter(f => f.toLowerCase().endsWith('.md'))
                .map(f => lib_4.path.basename(f)),
        ].map(f => ({
            title: f.replace('.md', ''),
            relativePath: f,
            // packageName: this.project.universalPackageName,
        }));
        //#endregion
    }
    //#endregion
    //#region private methods / link project to docs folder
    linkProjectToDocsFolder(packageName) {
        //#region @backendFunc
        if (this.project.nameForNpmPackage === packageName) {
            // Helpers.warn(
            //   `Project ${packageName} is the same as current project ${this.project.universalPackageName}`,
            // );
            return;
        }
        // console.log('packageName', packageName);
        let orgLocation;
        try {
            orgLocation = lib_3.fse.realpathSync((0, lib_4.crossPlatformPath)([
                lib_4.path.dirname(this.docsConfigGlobalContainerAbsPath),
                packageName,
            ]));
        }
        catch (error) {
            lib_11.Helpers.error(`Not found "${lib_3.chalk.bold(packageName)}" in global docs container. ` +
                `Update your externalDocs.project config.`, false, true);
        }
        const dest = this.project.pathFor([
            this.tmpDocsFolderRootDocsDirRelativePath,
            packageName,
        ]);
        if (lib_11.Helpers.filesFrom(orgLocation).length === 0) {
            const nearestProj = this.project.ins.nearestTo(orgLocation);
            lib_11.Helpers.warn(`

        Please rebuild docs for this project ${lib_3.chalk.bold(nearestProj?.genericName)}.

        `);
            return;
        }
        if (!this.linkedAlreadProjects[orgLocation]) {
            try {
                lib_3.fse.unlinkSync(dest);
            }
            catch (error) { }
            lib_11.Helpers.createSymLink(orgLocation, dest);
            // TODO unlink watcher when project no longer in docs-config.json
            lib_11.Helpers.info(`Listening changes of external project "${packageName}"..`);
            lib_3.chokidar
                .watch(this.getTimestampWatcherForPackageName(packageName), {
                ignoreInitial: true,
            })
                .on('all', () => {
                lib_11.Helpers.info(`Docs changed  in external project "${lib_3.chalk.bold(packageName)}".. rebuilding..`);
                this.action({
                    changeOfFiles: [],
                    asyncEvent: true,
                });
            });
        }
        this.linkedAlreadProjects[orgLocation] = true;
        //#endregion
    }
    //#endregion
    //#region private methods / resolve package data from
    resolvePackageDataFrom(packageNameWithPath) {
        //#region @backendFunc
        const isRelativePath = packageNameWithPath.startsWith('../') &&
            packageNameWithPath.startsWith('./');
        const isNpmOrgPath = packageNameWithPath.startsWith('@');
        // const isNormalNpmPackagePath = !isRelativePath && !isNpmOrgPath;
        if (isRelativePath) {
            lib_11.Helpers.error(`Relative pathes are not supported: ${this.docsConfigCurrentProjAbsPath}`, false, true);
        }
        const packageName = isNpmOrgPath
            ? packageNameWithPath.split('/').slice(0, 2).join('/')
            : lib_4._.first(packageNameWithPath.split('/'));
        this.linkProjectToDocsFolder(packageName);
        const destRelativePath = packageNameWithPath
            .replace(packageName + '/', '')
            .replace(packageName, '');
        return { packageName, destRelativePath };
        //#endregion
    }
    //#endregion
    //#region private methods / process md files
    async getExternalMdFiles() {
        //#region @backendFunc
        const externalMdFiles = [];
        const externalMdFies = this.config.externalDocs.mdfiles;
        for (const file of externalMdFies) {
            const { packageName, destRelativePath } = this.resolvePackageDataFrom(file.packageNameWithPath);
            const filePath = (0, lib_4.crossPlatformPath)([
                lib_4.path.dirname(this.docsConfigGlobalContainerAbsPath),
                packageName,
                destRelativePath,
            ]);
            if (!lib_11.Helpers.exists(filePath)) {
                lib_11.Helpers.warn(`File not found: ${filePath}. Skipping..`);
                continue;
            }
            const sourceAbsPath = lib_3.fse.realpathSync(filePath);
            const destinationAbsPath = this.project.pathFor([
                this.tmpDocsFolderRootDocsDirRelativePath,
                packageName,
                destRelativePath,
            ]);
            const destMagicRelativePath = file.overrideTitle
                ? file.overrideTitle + '.md'
                : (0, lib_4.crossPlatformPath)([packageName, destRelativePath])
                    .split('/')
                    .map(p => lib_4._.kebabCase(p.replace('.md', '')))
                    .join('__') + '.md';
            const destinationMagicAbsPath = this.project.pathFor([
                this.tmpDocsFolderRootDocsDirRelativePath,
                destMagicRelativePath,
            ]);
            lib_9.HelpersTaon.copyFile(sourceAbsPath, destinationAbsPath);
            if (file.magicRenameRules) {
                let content = lib_11.Helpers.readFile(destinationAbsPath);
                const rules = lib_1.RenameRule.from(file.magicRenameRules);
                for (const rule of rules) {
                    content = rule.replaceInString(content);
                }
                lib_11.Helpers.writeFile(destinationMagicAbsPath, content);
            }
            externalMdFiles.push({
                // packageName,
                relativePath: file.magicRenameRules
                    ? destMagicRelativePath
                    : (0, lib_4.crossPlatformPath)([packageName, destRelativePath]),
                title: file.overrideTitle
                    ? file.overrideTitle
                    : destRelativePath.replace('.md', ''),
            });
        }
        return externalMdFiles;
        //#endregion
    }
    //#endregion
    //#region private methods / get/process externalDocs.projects files
    async getProjectsFiles() {
        //#region @backendFunc
        return (this.config.externalDocs.projects || []).map(p => {
            const { packageName: firstPackageName, destRelativePath: firstDestRelativePath, } = this.resolvePackageDataFrom(Array.isArray(p.packageNameWithPath)
                ? lib_4._.first(p.packageNameWithPath)
                : p.packageNameWithPath);
            let title = p.overrideTitle
                ? p.overrideTitle
                : (0, lib_4.crossPlatformPath)([firstPackageName, firstDestRelativePath]);
            if (Array.isArray(p.packageNameWithPath)) {
                const joinEntrypointName = p.overrideTitle
                    ? p.overrideTitle + '.md'
                    : p.packageNameWithPath
                        .map(p => lib_4._.snakeCase(p.replace('.md', '')))
                        .join('__') + '.md';
                return {
                    title,
                    relativePath: joinEntrypointName,
                    // packageName: p.packageName,
                    contentToWrite: p.packageNameWithPath
                        .map(singlePackageNameWithPath => {
                        const { packageName, destRelativePath } = this.resolvePackageDataFrom(singlePackageNameWithPath);
                        const orgLocation = this.project.nameForNpmPackage === packageName
                            ? this.project.pathFor(this.tmpDocsFolderRootDocsDirRelativePath)
                            : lib_3.fse.realpathSync((0, lib_4.crossPlatformPath)([
                                lib_4.path.dirname(this.docsConfigGlobalContainerAbsPath),
                                packageName,
                            ]));
                        let fileContent = lib_11.Helpers.readFile([
                            orgLocation,
                            destRelativePath,
                        ]);
                        // if (singlePackageNameWithPath === 'taon/README.md') {
                        //   debugger;
                        // }
                        fileContent = lib_9.UtilsMd.moveAssetsPathsToLevel(fileContent);
                        const exterFileConfig = this.config.externalDocs.mdfiles.find(f => f.packageNameWithPath === singlePackageNameWithPath);
                        if (exterFileConfig?.magicRenameRules) {
                            const rules = lib_1.RenameRule.from(exterFileConfig.magicRenameRules);
                            for (const rule of rules) {
                                fileContent = rule.replaceInString(fileContent);
                            }
                        }
                        return fileContent;
                    })
                        .join('\n'),
                };
            }
            return {
                title,
                // packageName: p.packageName,
                relativePath: `${firstPackageName}/` +
                    `${firstDestRelativePath ? firstDestRelativePath : 'README.md'}`,
            };
        });
        //#endregion
    }
    //#endregion
    //#region private methods / recreate files in temp folder
    async recreateFilesInTempFolder(asyncEvent) {
        //#region @backendFunc
        const files = this.exitedFilesAbsPathes.filter(f => {
            if (lib_6.UtilsStringRegex.containsNonAscii(f)) {
                lib_11.Helpers.warn(`Omitting file with non-ascii characters in path: ${f}`);
                return false;
            }
            return true;
        });
        this.copyFilesToTempDocsFolder(files, asyncEvent);
        let rootFiles = await this.getRootFiles();
        const externalMdFiles = await this.getExternalMdFiles();
        const projectsFiles = await this.getProjectsFiles();
        const mapTitlesNames = this.config.mapTitlesNames || {};
        // Object.keys(mapTitlesNames).forEach(k => {
        //   mapTitlesNames[k] = mapTitlesNames[k].replace('.md', '');
        // });
        const allFiles = [...rootFiles, ...externalMdFiles, ...projectsFiles].map(
        //#region allow own packages redirection
        // QUICKFIX
        f => {
            if (f.relativePath.startsWith(`${this.project.nameForNpmPackage}/`)) {
                f.relativePath = f.relativePath.replace(`${this.project.nameForNpmPackage}/`, '');
            }
            if (mapTitlesNames[f.title]) {
                f.title = mapTitlesNames[f.title];
            }
            else if (mapTitlesNames[f.title.replace('.md', '')]) {
                f.title = mapTitlesNames[f.title.replace('.md', '')];
            }
            else if (mapTitlesNames[f.title + '.md']) {
                f.title = mapTitlesNames[f.title + '.md'];
            }
            return f;
        });
        //#region write join entrypoint files
        for (const projectFile of allFiles) {
            if ('contentToWrite' in projectFile) {
                this.project.writeFile([this.tmpDocsFolderRootDocsDirRelativePath, projectFile.relativePath], projectFile.contentToWrite);
            }
        }
        //#endregion
        this.project.writeFile([this.tmpDocsFolderRoot, 'mkdocs.yml'], this.mkdocsYmlContent(allFiles));
        //#endregion
    }
    //#endregion
    //#region private methods / write global watcher timestamp
    writeGlobalWatcherTimestamp() {
        //#region @backendFunc
        try {
            lib_11.Helpers.mkdirp(lib_4.path.dirname(this.docsGlobalTimestampForWatcherAbsPath));
        }
        catch (error) { }
        lib_11.Helpers.writeFile(this.docsGlobalTimestampForWatcherAbsPath, new Date().getTime().toString());
        //#endregion
    }
    //#endregion
    //#region private methods / get timestamp watcher for package name
    getTimestampWatcherForPackageName(universalPackageName) {
        //#region @backendFunc
        const globalContainer = this.project.ins.by(lib_2.LibTypeEnum.CONTAINER, this.project.framework.frameworkVersion);
        return globalContainer.pathFor(`.${lib_2.config.frameworkName}/watcher-timestamps-for/${universalPackageName}`);
        //#endregion
    }
}
exports.Docs = Docs;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/docs-webapp/docs.js.map