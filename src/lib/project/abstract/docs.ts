//#region imports
//#region @backend
import { fse } from 'tnp-core/src';
//#endregion
import { BaseProject, UtilsMd } from 'tnp-helpers/src';
import { BaseCompilerForProject } from 'tnp-helpers/src';
import { ChangeOfFile } from 'incremental-compiler/src';
import { config } from 'tnp-config/src';
import { BaseDebounceCompilerForProject } from 'tnp-helpers/src';
import { Helpers, UtilsHttp } from 'tnp-helpers/src';
import type { Project } from './project';
import { Models } from '../../models';
import { _, crossPlatformPath, path } from 'tnp-core/src';
import { MagicRenamer, RenameRule } from 'magic-renamer/src';
//#endregion

export class Docs extends BaseDebounceCompilerForProject<
  {
    disableMkdocsCompilation?: boolean;
    /**
     * Relative or absolute (TODO) path to the folder where the docs will be generated
     */
    docsOutFolder?: string;
  },
  Project
> {
  //#region fields & getters

  //#region fields & getters / docs config path
  public readonly docsConfig = 'docs-config.jsonc';
  public readonly docsConfigSchema = 'docs-config.schema.json';

  get config(): Models.DocsConfig {
    //#region @backendFunc
    return this.project.readJson(this.docsConfig) as Models.DocsConfig;
    //#endregion
  }

  //#endregion

  //#region init
  async init() {
    //#region @backendFunc
    this.project.removeFolderByRelativePath(
      this.tmpDocsFolderRootDocsDirRelativePath,
    );
    this.project.createFolder(this.tmpDocsFolderRootDocsDirRelativePath);
    if (!this.project.hasFile(this.docsConfig)) {
      this.project.writeJson(this.docsConfig, this.defaultDocsConfig());
    }
    try {
      fse.unlinkSync(this.project.pathFor(this.docsConfigSchema));
    } catch (error) {}
    Helpers.createSymLink(
      this.docsConfigSchemaPath,
      this.project.pathFor(this.docsConfigSchema),
    );
    this.project.vsCodeHelpers.recreateJsonSchemaForDocs();

    //#region link docs to global container
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
    //#endregion

    //#endregion
  }
  //#endregion

  //#region fields & getters / tmp docs folder path
  /**
   * mkdocs temp folder
   */
  public readonly tmpDocsFolderRoot = `.${config.frameworkName}/temp-docs-folder`;

  public readonly combinedDocsFolder = `allmdfiles`;
  get tmpDocsFolderRootDocsDirRelativePath() {
    //#region @backendFunc
    return crossPlatformPath([this.tmpDocsFolderRoot, this.combinedDocsFolder]);
    //#endregion
  }

  //#endregion

  //#region fields & getters / out docs folder path
  get outDocsDistFolderAbs() {
    //#region @backendFunc
    return this.project.pathFor([
      this.initalParams.docsOutFolder || `.${config.frameworkName}/docs-dist`,
    ]);
    //#endregion
  }
  //#endregion

  //#endregion

  //#region constructor
  //#region @backend
  constructor(project: Project) {
    super(project, {
      taskName: 'DocsProvider',
      folderPath: project.location,
      ignoreFolderPatter: [
        project.pathFor('tmp-*/**/*.*'),
        project.pathFor('tmp-*'),
        project.pathFor('dist/**/*.*'),
        project.pathFor('dist'),
        project.pathFor('browser/**/*.*'),
        project.pathFor('browser'),
        project.pathFor('websql/**/*.*'),
        project.pathFor('websql'),
        project.pathFor('.*/**/*.*'),
      ],
      subscribeOnlyFor: ['md', 'yml' as any],
    });
  }
  //#endregion
  //#endregion

  get docsConfigGlobalContainerAbsPath() {
    //#region @backendFunc
    const globalContainer = this.project.ins.by(
      'container',
      this.project.__frameworkVersion,
    );
    return globalContainer.pathFor(
      `.${config.frameworkName}/docs-from-projects/${this.project.universalPackageName}`,
    );
    //#endregion
  }

  //#region methods / get docs config json $schema

  get docsConfigSchemaPath(): string {
    //#region @backendFunc
    return this.project.ins
      .by('isomorphic-lib', this.project.__frameworkVersion)
      .pathFor(this.docsConfigSchema);
    //#endregion
  }

  protected docsConfigSchemaContent(): string {
    //#region @backendFunc
    return Helpers.readFile(this.docsConfigSchemaPath);
    //#endregion
  }
  //#endregion

  //#region methods / defaultDocsConfig
  protected defaultDocsConfig(): Models.DocsConfig {
    //#region @backendFunc
    return {
      site_name: this.project.name,
      additionalAssets: [],
      externalDocs: {
        mdfiles: [],
        projects: [],
      },
      omitFilesPatters: [],
      priorityOrder: [],
    } as Models.DocsConfig;
    //#endregion
  }
  //#endregion

  //#region methods / mkdocsYmlContent

  private applyPriorityOrder(
    files: { title: string; relativePath: string }[],
  ): { title: string; relativePath: string }[] {
    //#region @backendFunc
    const priorityOrder =
      (this.config.priorityOrder || []).length > 0
        ? this.config.priorityOrder
        : ['README.md'];

    // Filter out the priority files
    const prioritizedFiles = files.filter(file =>
      priorityOrder.includes(file.title),
    );

    // Filter out non-priority files
    const nonPrioritizedFiles = files.filter(
      file => !priorityOrder.includes(file.title),
    );

    // Return prioritized files first, followed by the rest
    const omitFilesPatters = this.config.omitFilesPatters || [];
    return [...prioritizedFiles, ...nonPrioritizedFiles].filter(
      f => f.title && !omitFilesPatters.includes(f.title),
    );
    //#endregion
  }

  mkdocsYmlContent(
    entryPointFilesRelativePaths: { title: string; relativePath: string }[],
  ): string {
    //#region @backendFunc
    // console.log({
    //   entryPointFilesRelativePaths,
    // });
    // TODO @LAST
    // - Introduction: introduction/index.md
    // - Setup: setup/index.md
    // - Isomorphic Code: isomorphic-code/index.md
    // - Development: development/index.md
    // - Tutorials: tutorials/index.md
    // - Changelog: changelog/index.md
    // - QA: qa/index.md
    // docs_dir: ./
    return `site_name: ${this.config.site_name ? this.config.site_name : _.upperFirst(this.project.name) + 'Documentation'}
# site_url:  ${this.project.__env.config.domain}
nav:
${this.applyPriorityOrder(entryPointFilesRelativePaths)
  .map(p => {
    if (p.relativePath === p.title) {
      `  - ${p.title}`;
    }
    return `  - ${p.title}: ${p.relativePath}`;
  })
  .join('\n')}
docs_dir: ./${this.combinedDocsFolder}
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
  - stylesheets/extra.css

extra_javascript:
  - javascripts/extra.js

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

  //#region methods / build mkdocs
  private async buildMkdocs({ watch }: { watch: boolean }) {
    //#region @backendFunc
    this.project.setValueToJSONC(
      config.file.package_json,
      'scripts.mkdocs',
      'python3 -m mkdocs',
    );
    if (watch) {
      const mkdocsServePort = await this.project.assignFreePort(3900);
      // python3 -m
      Helpers.run(
        //--quiet
        `python3 -m mkdocs serve -a localhost:${mkdocsServePort} `,
        {
          cwd: this.project.pathFor([this.tmpDocsFolderRoot]),
        },
      ).async();
      Helpers.info(`Mkdocs server started on port ${mkdocsServePort}`);
    } else {
      if (!Helpers.exists(this.outDocsDistFolderAbs)) {
        Helpers.mkdirp(this.outDocsDistFolderAbs);
      }
      Helpers.run(
        `python3 -m mkdocs build --site-dir ${this.outDocsDistFolderAbs}`,
        {
          cwd: this.project.pathFor([this.tmpDocsFolderRoot]),
        },
      ).sync();
    }
    //#endregion
  }
  //#endregion

  //#region methods / recreate files in temp folder
  private async recreateFilesInTempFolder(
    files: string[],
    asyncEvent: boolean,
  ) {
    //#region @backendFunc

    //#region copy files
    for (const asbFilePath of files) {
      const relativePath = this.project.relative(asbFilePath);
      console.log(
        `(${asyncEvent ? 'async' : 'sync'}) Files changed:`,
        relativePath,
      );
      Helpers.copyFile(
        asbFilePath,
        this.project.pathFor([
          this.tmpDocsFolderRootDocsDirRelativePath,
          relativePath,
        ]),
      );
      const assets = UtilsMd.getAssets(Helpers.readFile(asbFilePath));
      // TODO @LAST add assets to watching list
      for (const asset of assets) {
        const absPath = this.project.pathFor(asset);
        const destLocation = this.project.pathFor([
          this.tmpDocsFolderRootDocsDirRelativePath,
          asset,
        ]);
        Helpers.copyFile(absPath, destLocation);
      }
    }
    //#endregion

    const { externalMdFiles } = await this.processExternalMdFiles();

    const rootFiles = [
      ...Helpers.filesFrom(this.project.location)
        .filter(f => f.toLowerCase().endsWith('.md'))
        .map(f => path.basename(f)),
      ...externalMdFiles,
    ].map(f => ({ title: f, relativePath: f }));

    const linkedAlread = {};
    const projectsFiles = (this.config.externalDocs.projects || []).map(p => {
      const orgLocation = fse.realpathSync(
        crossPlatformPath([
          path.dirname(this.docsConfigGlobalContainerAbsPath),
          p.projectName,
        ]),
      );
      const dest = this.project.pathFor([
        this.tmpDocsFolderRootDocsDirRelativePath,
        p.projectName,
      ]);

      if (!linkedAlread[orgLocation]) {
        try {
          fse.unlinkSync(dest);
        } catch (error) {}
        Helpers.createSymLink(orgLocation, dest);
      }

      linkedAlread[orgLocation] = true;

      const entryPoint = p.entrypoint ? p.entrypoint : 'README.md';
      return {
        title: p.overrideName ? p.overrideName : p.projectName,
        relativePath: `${p.projectName}/${entryPoint}`,
      };
    });
    this.project.writeFile(
      [this.tmpDocsFolderRoot, 'mkdocs.yml'],
      this.mkdocsYmlContent([...rootFiles, ...projectsFiles]),
    );

    //#endregion
  }
  //#endregion

  //#region methods / action
  async action({
    changeOfFiles,
    asyncEvent,
  }: {
    changeOfFiles: ChangeOfFile[];
    asyncEvent: boolean;
  }) {
    //#region @backendFunc
    const files = changeOfFiles.map(f => f.fileAbsolutePath);
    // console.log({ files });
    // console.log('initalParams', this.initalParams);
    if (!asyncEvent) {
      //#region sync init
      await this.init();
      //#endregion
    }

    await this.recreateFilesInTempFolder(files, asyncEvent);

    if (!asyncEvent) {
      await this.buildMkdocs({ watch: this.isWatchCompilation });
      if (this.initalParams.docsOutFolder) {
        const portForDocs = await this.project.assignFreePort(3950);
        await UtilsHttp.startHttpServer(this.outDocsDistFolderAbs, portForDocs);
      }
    }
    //#endregion
  }
  //#endregion

  //#region methods / process md files
  async processExternalMdFiles(): Promise<{ externalMdFiles: string[] }> {
    //#region @backendFunc
    const externalMdFiles = [];
    const externalMdFies = this.config.externalDocs.mdfiles;
    for (const file of externalMdFies) {
      const possiblePathes = Array.isArray(file.path) ? file.path : [file.path];
      for (const possiblePath of possiblePathes) {
        const absPath = this.project.pathFor(possiblePath);
        if (Helpers.exists(absPath)) {
          const destLocation = this.project.pathFor([
            this.tmpDocsFolderRootDocsDirRelativePath,
            path.basename(possiblePath),
          ]);
          Helpers.copyFile(absPath, destLocation);

          if (file.magicRenameRules) {
            let content = Helpers.readFile(destLocation);
            const rules = RenameRule.from(file.magicRenameRules);
            for (const rule of rules) {
              content = rule.replaceInString(content);
            }
            Helpers.writeFile(destLocation, content);
          }
          externalMdFiles.push(path.basename(destLocation));
          break;
        }
      }
    }
    return { externalMdFiles };
    //#endregion
  }
  //#endregion
}
