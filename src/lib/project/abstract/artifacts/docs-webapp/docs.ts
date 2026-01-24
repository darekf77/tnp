//#region imports
import { ChangeOfFile } from 'incremental-compiler/src';
import { RenameRule } from 'magic-renamer/src';
import {
  config,
  LibTypeEnum,
  UtilsExecProc,
  UtilsTerminal,
} from 'tnp-core/src';
import { chalk, chokidar, fse, Utils } from 'tnp-core/src';
import { _, crossPlatformPath, path } from 'tnp-core/src';
import { UtilsOs } from 'tnp-core/src';
import { UtilsStringRegex } from 'tnp-core/src';
import { UtilsFilesFoldersSync } from 'tnp-core/src';
import { dotTaonFolder, dotTnpFolder } from 'tnp-core/src';
import { HelpersTaon, UtilsMd } from 'tnp-helpers/src';
import { BaseDebounceCompilerForProject } from 'tnp-helpers/src';
import { Helpers, UtilsHttp } from 'tnp-helpers/src';

import {
  browserMainProject,
  combinedDocsAllMdFilesFolder,
  customDefaultCss,
  customDefaultJs,
  distMainProject,
  docsConfigJsonFileName,
  docsConfigSchema,
  projectsFromMainProject,
  projectsFromNgTemplate,
  srcMainProject,
  websqlMainProject,
} from '../../../../constants';
import { Models } from '../../../../models';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
//#endregion

//#region models / EntrypointFile
type EntrypointFile = {
  title: string;
  relativePath: string;
  // packageName: string;
  contentToWrite?: string;
};
//#endregion

export class Docs extends BaseDebounceCompilerForProject<
  {
    disableMkdocsCompilation?: boolean;
    /**
     * Relative or absolute (TODO) path to the folder where the docs will be generated
     */
    docsOutFolder?: string;
    ciBuild?: boolean;
    port?: number;
  },
  // @ts-ignore TODO weird inheritance problem
  Project
> {
  //#region fields & getters
  private envOptions: EnvOptions;

  protected mkdocsServePort: number;

  private linkedAlreadProjects = {};

  //#region fields & getters / docs config current proj abs path
  public get docsConfigCurrentProjAbsPath(): string {
    //#region @backendFunc
    return this.project.pathFor(docsConfigJsonFileName);
    //#endregion
  }
  //#endregion

  //#region fields & getters / docs config
  get config(): Models.DocsConfig {
    //#region @backendFunc
    return this.project.readJson(docsConfigJsonFileName) as Models.DocsConfig;
    //#endregion
  }
  //#endregion

  //#region fields & getters / linkd docs to global container
  private linkDocsToGlobalContainer(): void {
    //#region @backendFunc
    if (!Helpers.exists(path.dirname(this.docsConfigGlobalContainerAbsPath))) {
      Helpers.mkdirp(path.dirname(this.docsConfigGlobalContainerAbsPath));
    }
    try {
      fse.unlinkSync(this.docsConfigGlobalContainerAbsPath);
    } catch (error) {}
    Helpers.createSymLink(
      this.project.pathFor(this.tmpDocsFolderRootDocsDirRelativePath),
      this.docsConfigGlobalContainerAbsPath,
    );

    this.writeGlobalWatcherTimestamp();
    //#endregion
  }
  //#endregion

  //#region fields & getters / tmp docs folder path
  /**
   * mkdocs temp folder
   */
  public readonly tmpDocsFolderRoot: string = `.${config.frameworkName}/temp-docs-folder`;

  /**
   * Example:
   * .taon/temp-docs-folder/allmdfiles
   */
  get tmpDocsFolderRootDocsDirRelativePath(): string {
    //#region @backendFunc
    return crossPlatformPath([
      this.tmpDocsFolderRoot,
      combinedDocsAllMdFilesFolder,
    ]);
    //#endregion
  }

  //#endregion

  //#region fields & getters / out docs folder path
  get outDocsDistFolderAbs() {
    //#region @backendFunc
    return this.project.pathFor([
      this.initialParams.docsOutFolder || `.${config.frameworkName}/docs-dist`,
    ]);
    //#endregion
  }
  //#endregion

  //#region n fields & getters / docs config global container abs path
  get docsConfigGlobalContainerAbsPath() {
    //#region @backendFunc
    const globalContainer = this.project.ins.by(
      LibTypeEnum.CONTAINER,
      this.project.framework.frameworkVersion,
    );
    return globalContainer.pathFor(
      `.${config.frameworkName}/docs-from-projects/${this.project.nameForNpmPackage}`,
    );
    //#endregion
  }
  //#endregion

  //#region fields & getters / docs global timestamp for watcher abs path
  get docsGlobalTimestampForWatcherAbsPath() {
    //#region @backendFunc
    return this.getTimestampWatcherForPackageName(
      this.project.nameForNpmPackage,
    );
    //#endregion
  }
  //#endregion

  //#region n fields & getters / docs config schema path
  get docsConfigSchemaPath(): string {
    //#region @backendFunc
    return this.project.ins
      .by(LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
      .pathFor(docsConfigSchema);
    //#endregion
  }
  //#endregion

  //#endregion

  //#region methods / init
  async init() {
    //#region @backendFunc

    this.project.removeFolderByRelativePath(
      this.tmpDocsFolderRootDocsDirRelativePath,
    );
    this.project.createFolder(this.tmpDocsFolderRootDocsDirRelativePath);
    if (!this.project.hasFile(docsConfigJsonFileName)) {
      this.project.writeJson(docsConfigJsonFileName, this.defaultDocsConfig());
    }

    if (!this.project.framework.isCoreProject) {
      try {
        fse.unlinkSync(this.project.pathFor(docsConfigSchema));
      } catch (error) {}

      if (Helpers.exists(this.docsConfigSchemaPath)) {
        // TODO @LAST GENERATE DOCS CONFIG SCHAMA IN CORE PROJECTS
        Helpers.createSymLink(
          this.docsConfigSchemaPath,
          this.project.pathFor(docsConfigSchema),
          { continueWhenExistedFolderDoesntExists: true },
        );
      }
    }

    this.linkDocsToGlobalContainer();

    //#endregion
  }
  //#endregion

  //#region methods / initialize watchers
  initializeWatchers(envOptions: EnvOptions): void {
    this.envOptions = envOptions;
    const project = this.project;
    this.initOptions({
      taskName: `DocsProviderFor${_.upperFirst(
        _.camelCase(this.project.location),
      )}`,
      folderPath: project.location,
      ignoreFolderPatter: [
        project.pathFor('tmp-*/**'),
        project.pathFor('tmp-*'),
        project.pathFor(`${distMainProject}/**`),
        project.pathFor(distMainProject),
        project.pathFor(`${distMainProject}-*/**`),
        project.pathFor(`${browserMainProject}/**`),
        project.pathFor(browserMainProject),
        project.pathFor(`${websqlMainProject}/**`),
        project.pathFor(websqlMainProject),
        project.pathFor(`${projectsFromMainProject}/**`),
        project.pathFor(projectsFromMainProject),
        project.pathFor(`${dotTaonFolder}/**`),
        project.pathFor(dotTaonFolder),
        project.pathFor(`${dotTnpFolder}/**`),
        project.pathFor(dotTnpFolder),
        ...['ts', 'tsx', 'scss', 'html'].map(ext =>
          project.pathFor(`${srcMainProject}/**/*.${ext}`),
        ),
        // TODO I may include in feature for example .ts files in md files with handlebars
      ],
      subscribeOnlyFor: ['md', 'yml' as any, 'jpg', 'png', 'gif', 'svg'],
    });
  }
  //#endregion

  //#region methods / action
  async action({
    changeOfFiles,
    asyncEvent,
  }: {
    changeOfFiles: ChangeOfFile[];
    asyncEvent: boolean;
  }): Promise<void> {
    //#region @backendFunc
    // if (asyncEvent) {
    //   console.log(
    //     'changeOfFiles',
    //     changeOfFiles.map(f => f.fileAbsolutePath),
    //   );
    // }
    // QUICK_FIX
    if (
      asyncEvent &&
      changeOfFiles.length === 1 &&
      _.first(changeOfFiles)?.fileAbsolutePath ===
        this.docsGlobalTimestampForWatcherAbsPath
    ) {
      return;
    }

    if (!asyncEvent) {
      await this.init();
    }

    await this.recreateFilesInTempFolder(asyncEvent);

    if (!asyncEvent) {
      await this.buildMkdocs({ watch: this.isWatchCompilation });

      chokidar
        .watch(this.project.pathFor(docsConfigJsonFileName), {
          ignoreInitial: true,
        })
        .on('all', async () => {
          Helpers.info(
            'Docs config changed (docs-config.jsonc).. rebuilding..',
          );
          await this.action({
            changeOfFiles: [],
            asyncEvent: true,
          });
        });

      Helpers.info(
        `${this.isWatchCompilation ? 'Watch' : 'Normal'} docs build done` +
          `${this.isWatchCompilation ? '. Watching..' : '.'}`,
      );
    }
    if (asyncEvent) {
      this.writeGlobalWatcherTimestamp();
    }
    //#endregion
  }
  //#endregion

  //#region methods / docs config json $schema content
  protected docsConfigSchemaContent(): string {
    //#region @backendFunc
    return Helpers.readFile(this.docsConfigSchemaPath);
    //#endregion
  }
  //#endregion

  //#region private methods

  //#region private methods / default docs config
  private defaultDocsConfig(): Models.DocsConfig {
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
    } as Models.DocsConfig;
    //#endregion
  }
  //#endregion

  //#region private methods / apply priority order

  private applyPriorityOrder(files: EntrypointFile[]): EntrypointFile[] {
    //#region @backendFunc
    const orderByPriority = (items: EntrypointFile[], priority: string[]) => {
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

    files = orderByPriority(
      files,
      (this.config.priorityOrder || []).map(p => p.replace('.md', '')),
    );

    // Return prioritized files first, followed by the rest
    const omitFilesPatters = this.config.omitFilesPatters || [];
    const result = Utils.uniqArray(
      // [...prioritizedFiles, ...nonPrioritizedFiles]
      files.filter(
        f =>
          f.title &&
          !omitFilesPatters
            .map(a => a.replace('.md', ''))
            .includes(f.title.replace('.md', '')),
      ),
      'relativePath',
    );

    return result as EntrypointFile[];
    //#endregion
  }
  //#endregion

  //#region private methods / mkdocs.yml content
  private mkdocsYmlContent(
    entryPointFilesRelativePaths: EntrypointFile[],
  ): string {
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
    return `site_name: ${
      this.config.site_name
        ? this.config.site_name
        : _.upperFirst(this.project.name) + 'Documentation'
    }
# site_url:  ${this.envOptions.website.domain}
nav:
${this.applyPriorityOrder(entryPointFilesRelativePaths)
  .map(p => {
    if (p.relativePath === p.title) {
      `  - ${_.replace(p.title, /[_\s]/g, ' ')}`;
    }
    return `  - ${_.replace(p.title, /[_\s]/g, ' ')}: ${p.relativePath}`;
  })
  .join('\n')}
docs_dir: ./${combinedDocsAllMdFilesFolder}
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
  - ${this.config.customCssPath || customDefaultCss}

extra_javascript:
  - ${this.config.customJsPath || customDefaultJs}

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

  async validateEnvironemntForMkdocsBuild(): Promise<boolean> {
    //#region @backendFunc
    const pythonExists = await UtilsOs.commandExistsAsync('python3');
    if (!pythonExists) {
      Helpers.error(
        `Python3 is not installed.
        Please install Python3 to build mkdocs documentation.`,
        true,
        true,
      );
      return false;
    }
    let mkdocsExists = await UtilsOs.pythonModuleExists('mkdocs');
    if (!mkdocsExists) {
      Helpers.logWarn(
        `Mkdocs module not found in python3 environment. Checking pipx..`,
      );
      mkdocsExists = await UtilsOs.pipxPackageExists('mkdocs');
      if (!mkdocsExists) {
        Helpers.error(
          `Mkdocs is not installed in your Python3 environment.
          Please install mkdocs module.`,
          true,
          true,
        );
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
  private async buildMkdocs({ watch }: { watch: boolean }) {
    //#region @backendFunc

    const isEnvValid = await this.validateEnvironemntForMkdocsBuild();
    if (!isEnvValid) {
      Helpers.error(`Cannot build mkdocs documentation. `, true, true);
      process.exit(1);
    }

    if (watch) {
      this.mkdocsServePort = await this.project.registerAndAssignPort(
        'mkdocs serve',
        {
          startFrom: 3900,
        },
      );
      await Helpers.killOnPort(this.mkdocsServePort);
      const quiet = true;
      const serveCommand =
        process.platform !== 'win32'
          ? `mkdocs serve -a localhost:${this.mkdocsServePort} ${quiet ? '--quiet' : ''}`
          : //--quiet
            `python3 -m mkdocs serve -a localhost:${this.mkdocsServePort} ${quiet ? '--quiet' : ''}`;

      // console.log({
      //   serveCommand,
      // });

      Helpers.run(serveCommand, {
        cwd: this.project.pathFor([this.tmpDocsFolderRoot]),
      }).async();

      Helpers.info(
        chalk.bold(`Mkdocs server started on  http://localhost:${this.mkdocsServePort}
         Serving docs from temp folder: ${this.tmpDocsFolderRoot}
        `),
      );
    } else {
      if (!Helpers.exists(this.outDocsDistFolderAbs)) {
        Helpers.mkdirp(this.outDocsDistFolderAbs);
      }
      Helpers.run(
        process.platform !== 'win32'
          ? `mkdocs build --site-dir ${this.outDocsDistFolderAbs}`
          : //
            `python3 -m mkdocs build --site-dir ${this.outDocsDistFolderAbs}`,
        {
          cwd: this.project.pathFor([this.tmpDocsFolderRoot]),
        },
      ).sync();
    }
    //#endregion
  }
  //#endregion

  // TODO @LAST hande @render tag in md files

  //#region private methods / copy files to docs folder
  private copyFilesToTempDocsFolder(
    relativeFilePathesToCopy: string[],
    asyncEvent: boolean,
  ) {
    //#region @backendFunc
    let counterCopy = 0;

    //#region handle custom js/css files
    Helpers.info(`Handling custom js/css custom files..
      css: ${this.config.customCssPath || customDefaultCss}
      js: ${this.config.customJsPath || customDefaultJs}
      `);
    if (
      this.config.customCssPath &&
      this.project.hasFile(this.config.customCssPath)
    ) {
      HelpersTaon.copyFile(
        this.project.pathFor(this.config.customCssPath),
        this.project.pathFor([
          this.tmpDocsFolderRootDocsDirRelativePath,
          this.config.customCssPath,
        ]),
      );
    } else {
      this.project.writeFile(
        [this.tmpDocsFolderRootDocsDirRelativePath, customDefaultCss],
        '',
      );
    }

    if (
      this.config.customJsPath &&
      this.project.hasFile(this.config.customJsPath)
    ) {
      HelpersTaon.copyFile(
        this.project.pathFor(this.config.customJsPath),
        this.project.pathFor([
          this.tmpDocsFolderRootDocsDirRelativePath,
          this.config.customJsPath,
        ]),
      );
    } else {
      this.project.writeFile(
        [this.tmpDocsFolderRootDocsDirRelativePath, customDefaultJs],
        '',
      );
    }
    //#endregion

    for (const asbFileSourcePath of relativeFilePathesToCopy) {
      if (
        Helpers.isFolder(asbFileSourcePath) ||
        Helpers.isSymlinkFileExitedOrUnexisted(asbFileSourcePath)
      ) {
        continue;
      }
      const relativeFileSourcePath = this.project.relative(asbFileSourcePath);
      // console.log(
      //   `(${asyncEvent ? 'async' : 'sync'}) Files changed:`,
      //   relativeFileSourcePath,
      // );
      const isNotInRootMdFile =
        path.basename(asbFileSourcePath) !== relativeFileSourcePath;

      if (isNotInRootMdFile) {
        // console.info('repalcign...');
        const contentWithReplacedSomeLinks =
          UtilsMd.moveAssetsPathsToLevelFromFile(asbFileSourcePath);
        // console.info('repalcign done...');
        UtilsFilesFoldersSync.writeFile(
          this.project.pathFor([
            this.tmpDocsFolderRootDocsDirRelativePath,
            relativeFileSourcePath,
          ]),
          contentWithReplacedSomeLinks,
          {
            writeImagesWithoutEncodingUtf8: true,
          },
        );
      } else {
        HelpersTaon.copyFile(
          asbFileSourcePath,
          this.project.pathFor([
            this.tmpDocsFolderRootDocsDirRelativePath,
            relativeFileSourcePath,
          ]),
        );
      }

      counterCopy++;
      const assetsFromMdFile = UtilsMd.getAssetsFromFile(asbFileSourcePath);
      // if (path.basename(asbFilePath) === 'QA.md') {
      // console.log(`assets for ${relativeFileSourcePath}`, assetsFromMdFile);
      // }

      // TODO add assets to watching list
      for (const assetRelativePathFromFile of assetsFromMdFile) {
        const hasSlash = relativeFileSourcePath.includes('/');
        const slash = hasSlash ? '/' : '';

        const relativeAssetPath = relativeFileSourcePath.replace(
          slash + path.basename(relativeFileSourcePath),
          slash + assetRelativePathFromFile,
        );

        if (UtilsStringRegex.containsNonAscii(relativeAssetPath)) {
          // console.log({
          //   assetRelativePathFromFile,
          //   relativeAssetPath,
          // })
          Helpers.warn(
            `Omitting file with non-ascii characters in path: ${relativeAssetPath}`,
          );
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

        console.log(
          `Copy asset
          "${assetRelativePathFromFile}"
          "${chalk.bold(relativeAssetPath)}"
          to "${assetDestLocationAbsPath}"
          `,
        );

        HelpersTaon.copyFile(assetSourcetAbsPath, assetDestLocationAbsPath);

        counterCopy++;
      }
    }
    const asyncInfo = asyncEvent
      ? `\nRefreshing http://localhost:${this.mkdocsServePort}..`
      : '';

    Helpers.info(
      `(${
        asyncEvent ? 'async' : 'sync'
      }) [${Utils.fullDateTime()}] Copied ${counterCopy} ` +
        `files to temp docs folder. ${asyncInfo}`,
    );
    //#endregion
  }
  //#endregion

  //#region private methods / get root files
  private async getRootFiles(): Promise<EntrypointFile[]> {
    //#region @backendFunc

    return [
      ...Helpers.getFilesFrom(this.project.location, {
        recursive: false,
      })
        .filter(f => f.toLowerCase().endsWith('.md'))
        .map(f => path.basename(f)),
    ].map(f => ({
      title: f.replace('.md', ''),
      relativePath: f,
      // packageName: this.project.universalPackageName,
    }));
    //#endregion
  }
  //#endregion

  //#region private methods / link project to docs folder
  private linkProjectToDocsFolder(packageName: string) {
    //#region @backendFunc

    if (this.project.nameForNpmPackage === packageName) {
      // Helpers.warn(
      //   `Project ${packageName} is the same as current project ${this.project.universalPackageName}`,
      // );
      return;
    }

    // console.log('packageName', packageName);
    let orgLocation: string;
    try {
      orgLocation = fse.realpathSync(
        crossPlatformPath([
          path.dirname(this.docsConfigGlobalContainerAbsPath),
          packageName,
        ]),
      );
    } catch (error) {
      Helpers.error(
        `Not found "${chalk.bold(packageName)}" in global docs container. ` +
          `Update your externalDocs.project config.`,
        false,
        true,
      );
    }

    const dest = this.project.pathFor([
      this.tmpDocsFolderRootDocsDirRelativePath,
      packageName,
    ]);

    if (Helpers.filesFrom(orgLocation).length === 0) {
      const nearestProj = this.project.ins.nearestTo(orgLocation);
      Helpers.warn(
        `

        Please rebuild docs for this project ${chalk.bold(
          nearestProj?.genericName,
        )}.

        `,
      );
      return;
    }

    if (!this.linkedAlreadProjects[orgLocation]) {
      try {
        fse.unlinkSync(dest);
      } catch (error) {}
      Helpers.createSymLink(orgLocation, dest);

      // TODO unlink watcher when project no longer in docs-config.json
      Helpers.info(`Listening changes of external project "${packageName}"..`);
      chokidar
        .watch(this.getTimestampWatcherForPackageName(packageName), {
          ignoreInitial: true,
        })
        .on('all', () => {
          Helpers.info(
            `Docs changed  in external project "${chalk.bold(
              packageName,
            )}".. rebuilding..`,
          );
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
  private resolvePackageDataFrom(packageNameWithPath: string): {
    /**
     * global linked package name
     */
    packageName: string;
    /**
     * relative path of the file
     */
    destRelativePath: string;
  } {
    //#region @backendFunc

    const isRelativePath =
      packageNameWithPath.startsWith('../') &&
      packageNameWithPath.startsWith('./');

    const isNpmOrgPath = packageNameWithPath.startsWith('@');
    // const isNormalNpmPackagePath = !isRelativePath && !isNpmOrgPath;
    if (isRelativePath) {
      Helpers.error(
        `Relative pathes are not supported: ${this.docsConfigCurrentProjAbsPath}`,
        false,
        true,
      );
    }

    const packageName = isNpmOrgPath
      ? packageNameWithPath.split('/').slice(0, 2).join('/')
      : _.first(packageNameWithPath.split('/'));

    this.linkProjectToDocsFolder(packageName);

    const destRelativePath = packageNameWithPath
      .replace(packageName + '/', '')
      .replace(packageName, '');

    return { packageName, destRelativePath };
    //#endregion
  }
  //#endregion

  //#region private methods / process md files
  private async getExternalMdFiles(): Promise<EntrypointFile[]> {
    //#region @backendFunc
    const externalMdFiles: EntrypointFile[] = [];
    const externalMdFies = this.config.externalDocs.mdfiles;

    for (const file of externalMdFies) {
      const { packageName, destRelativePath } = this.resolvePackageDataFrom(
        file.packageNameWithPath,
      );

      const filePath = crossPlatformPath([
        path.dirname(this.docsConfigGlobalContainerAbsPath),
        packageName,
        destRelativePath,
      ]);

      if (!Helpers.exists(filePath)) {
        Helpers.warn(`File not found: ${filePath}. Skipping..`);
        continue;
      }

      const sourceAbsPath = fse.realpathSync(filePath);

      const destinationAbsPath = this.project.pathFor([
        this.tmpDocsFolderRootDocsDirRelativePath,
        packageName,
        destRelativePath,
      ]);

      const destMagicRelativePath = file.overrideTitle
        ? file.overrideTitle + '.md'
        : crossPlatformPath([packageName, destRelativePath])
            .split('/')
            .map(p => _.kebabCase(p.replace('.md', '')))
            .join('__') + '.md';

      const destinationMagicAbsPath = this.project.pathFor([
        this.tmpDocsFolderRootDocsDirRelativePath,
        destMagicRelativePath,
      ]);

      HelpersTaon.copyFile(sourceAbsPath, destinationAbsPath);

      if (file.magicRenameRules) {
        let content = Helpers.readFile(destinationAbsPath);
        const rules = RenameRule.from(file.magicRenameRules);
        for (const rule of rules) {
          content = rule.replaceInString(content);
        }
        Helpers.writeFile(destinationMagicAbsPath, content);
      }

      externalMdFiles.push({
        // packageName,
        relativePath: file.magicRenameRules
          ? destMagicRelativePath
          : crossPlatformPath([packageName, destRelativePath]),
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
  private async getProjectsFiles(): Promise<EntrypointFile[]> {
    //#region @backendFunc

    return (this.config.externalDocs.projects || []).map(p => {
      const {
        packageName: firstPackageName,
        destRelativePath: firstDestRelativePath,
      } = this.resolvePackageDataFrom(
        Array.isArray(p.packageNameWithPath)
          ? _.first(p.packageNameWithPath)
          : p.packageNameWithPath,
      );

      let title: string = p.overrideTitle
        ? p.overrideTitle
        : crossPlatformPath([firstPackageName, firstDestRelativePath]);

      if (Array.isArray(p.packageNameWithPath)) {
        const joinEntrypointName = p.overrideTitle
          ? p.overrideTitle + '.md'
          : p.packageNameWithPath
              .map(p => _.snakeCase(p.replace('.md', '')))
              .join('__') + '.md';

        return {
          title,
          relativePath: joinEntrypointName,
          // packageName: p.packageName,
          contentToWrite: p.packageNameWithPath
            .map(singlePackageNameWithPath => {
              const { packageName, destRelativePath } =
                this.resolvePackageDataFrom(singlePackageNameWithPath);

              const orgLocation =
                this.project.nameForNpmPackage === packageName
                  ? this.project.pathFor(
                      this.tmpDocsFolderRootDocsDirRelativePath,
                    )
                  : fse.realpathSync(
                      crossPlatformPath([
                        path.dirname(this.docsConfigGlobalContainerAbsPath),
                        packageName,
                      ]),
                    );

              let fileContent = Helpers.readFile([
                orgLocation,
                destRelativePath,
              ]);

              // if (singlePackageNameWithPath === 'taon/README.md') {
              //   debugger;
              // }

              fileContent = UtilsMd.moveAssetsPathsToLevel(fileContent);

              const exterFileConfig = this.config.externalDocs.mdfiles.find(
                f => f.packageNameWithPath === singlePackageNameWithPath,
              );
              if (exterFileConfig?.magicRenameRules) {
                const rules = RenameRule.from(exterFileConfig.magicRenameRules);
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
        relativePath:
          `${firstPackageName}/` +
          `${firstDestRelativePath ? firstDestRelativePath : 'README.md'}`,
      };
    });
    //#endregion
  }
  //#endregion

  //#region private methods / recreate files in temp folder
  private async recreateFilesInTempFolder(asyncEvent: boolean) {
    //#region @backendFunc
    const files: string[] = this.exitedFilesAbsPathes.filter(f => {
      if (UtilsStringRegex.containsNonAscii(f)) {
        Helpers.warn(`Omitting file with non-ascii characters in path: ${f}`);
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
          f.relativePath = f.relativePath.replace(
            `${this.project.nameForNpmPackage}/`,
            '',
          );
        }
        if (mapTitlesNames[f.title]) {
          f.title = mapTitlesNames[f.title];
        } else if (mapTitlesNames[f.title.replace('.md', '')]) {
          f.title = mapTitlesNames[f.title.replace('.md', '')];
        } else if (mapTitlesNames[f.title + '.md']) {
          f.title = mapTitlesNames[f.title + '.md'];
        }
        return f;
      },
      //#endregion
    );

    //#region write join entrypoint files
    for (const projectFile of allFiles) {
      if ('contentToWrite' in projectFile) {
        this.project.writeFile(
          [this.tmpDocsFolderRootDocsDirRelativePath, projectFile.relativePath],
          projectFile.contentToWrite,
        );
      }
    }
    //#endregion

    this.project.writeFile(
      [this.tmpDocsFolderRoot, 'mkdocs.yml'],
      this.mkdocsYmlContent(allFiles),
    );
    //#endregion
  }
  //#endregion

  //#region private methods / write global watcher timestamp
  private writeGlobalWatcherTimestamp() {
    //#region @backendFunc
    try {
      Helpers.mkdirp(path.dirname(this.docsGlobalTimestampForWatcherAbsPath));
    } catch (error) {}
    Helpers.writeFile(
      this.docsGlobalTimestampForWatcherAbsPath,
      new Date().getTime().toString(),
    );
    //#endregion
  }
  //#endregion

  //#region private methods / get timestamp watcher for package name

  private getTimestampWatcherForPackageName(universalPackageName: string) {
    //#region @backendFunc
    const globalContainer = this.project.ins.by(
      LibTypeEnum.CONTAINER,
      this.project.framework.frameworkVersion,
    );
    return globalContainer.pathFor(
      `.${config.frameworkName}/watcher-timestamps-for/${universalPackageName}`,
    );
    //#endregion
  }
  //#endregion

  //#endregion
}
