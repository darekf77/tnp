//#region imports
import * as JSON5 from 'json5';
import { config } from 'tnp-config/src';
import { fse, crossPlatformPath, CoreModels, chalk } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import {
  frameworkBuildFolders,
  taonConfigSchemaJsonStandalone,
  taonConfigSchemaJsonContainer,
} from '../../../../../../constants';
import { EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';
//#endregion

export type RecreateFile = { where: string; from: string };

export class FilesRecreator // @ts-ignore TODO weird inheritance problem
  extends BaseFeatureForProject<Project>
{
  //#region recreate simple files
  public async init(): Promise<void> {
    //#region @backendFunc
    this.handleProjectSpecyficFiles();

    this.gitignore();
    this.npmignore();
    //#endregion
  }
  //#endregion

  //#region getters & methods / project specify files
  /**
   * Return list of files that are copied from
   * core project each time struct method is called
   * @returns list of relative paths
   */
  projectSpecyficFiles() {
    //#region @backendFunc
    let files = ['index.js', 'index.d.ts', 'index.js.map'];

    if (this.project.framework.isContainer) {
      return [taonConfigSchemaJsonContainer, 'eslint.config.js'];
    }

    if (this.project.framework.isStandaloneProject) {
      files = files
        .concat([
          taonConfigSchemaJsonStandalone,
          'tsconfig.browser.json',
          'webpack.config.js',
          'run.js',
          'update-vscode-package-json.js',
          'eslint.config.js',
          ...this.__filesTemplates(),
        ])
        .concat(
          !this.project.framework.isStandaloneProject
            ? ['src/typings.d.ts']
            : [],
        );

      if (this.project.framework.frameworkVersionAtLeast('v2')) {
        files = files.filter(f => f !== 'tsconfig.browser.json');
      }

      if (this.project.framework.frameworkVersionAtLeast('v3')) {
        files = files.filter(f => !this.__ignoreInV3.includes(f));
      }
    }

    return files;
    //#endregion
  }
  //#endregion

  //#region getters & methods / ignore from v3 framework version
  get __ignoreInV3() {
    //#region @backendFunc
    const files = [
      'angular.json.filetemplate',
      'ngsw-config.json.filetemplate',
    ];
    return [...files, ...files.map(f => f.replace('.filetemplate', ''))];
    //#endregion
  }
  //#endregion

  //#region init vscode
  initVscode(): void {
    //#region @backendFunc
    this.vscode.settings.hideOrShowFilesInVscode(true);
    //#endregion
  }
  //#endregion

  //#region dummy angular.json file
  /**
   * dummy angular.json file for scss generation
   */
  get angularJsonContainer() {
    //#region @backendFunc
    return {
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      newProjectRoot: 'projects',
      projects: {
        'sassy-project': {
          projectType: 'application',
          schematics: {
            '@schematics/angular:component': {
              style: 'scss',
            },
            '@schematics/angular:application': {
              strict: true,
            },
          },
          root: '',
          sourceRoot: 'src',
          prefix: 'app',
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:browser',
              options: {
                outputPath: 'dist/sassy-project',
                index: 'src/index.html',
                main: 'src/main.ts',
                polyfills: 'src/polyfills.ts',
                tsConfig: 'tsconfig.app.json',
                inlineStyleLanguage: 'scss',
                assets: ['src/favicon.ico', 'src/assets'],
                styles: ['src/styles.scss'],
                scripts: [],
              },
              configurations: {
                production: {
                  budgets: [
                    {
                      type: 'initial',
                      maximumWarning: '500kb',
                      maximumError: '1mb',
                    },
                    {
                      type: 'anyComponentStyle',
                      maximumWarning: '2kb',
                      maximumError: '4kb',
                    },
                  ],
                  fileReplacements: [
                    {
                      replace: 'src/environments/environment.ts',
                      with: 'src/environments/environment.prod.ts',
                    },
                  ],
                  outputHashing: 'all',
                },
                development: {
                  buildOptimizer: false,
                  optimization: false,
                  vendorChunk: true,
                  extractLicenses: false,
                  sourceMap: true,
                  namedChunks: true,
                },
              },
              defaultConfiguration: 'production',
            },
            serve: {
              builder: '@angular-devkit/build-angular:dev-server',
              configurations: {
                production: {
                  browserTarget: 'sassy-project:build:production',
                },
                development: {
                  browserTarget: 'sassy-project:build:development',
                },
              },
              defaultConfiguration: 'development',
            },
            'extract-i18n': {
              builder: '@angular-devkit/build-angular:extract-i18n',
              options: {
                browserTarget: 'sassy-project:build',
              },
            },
            // "test": {
            //   "builder": "@angular-devkit/build-angular:karma",
            //   "options": {
            //     "main": "src/test.ts",
            //     "polyfills": "src/polyfills.ts",
            //     "tsConfig": "tsconfig.spec.json",
            //     "karmaConfig": "karma.conf.js",
            //     "inlineStyleLanguage": "scss",
            //     "assets": [
            //       "src/favicon.ico",
            //       "src/assets"
            //     ],
            //     "styles": [
            //       "src/styles.scss"
            //     ],
            //     "scripts": []
            //   }
            // }
          },
        },
      },
      defaultProject: 'sassy-project',
    };
    //#endregion
  }
  //#endregion

  //#region files ignored by
  get filesIgnoredBy() {
    //#region @backendFunc
    const self = this;
    return {
      get vscodeSidebarFilesView() {
        // const siteFiles = ['src', 'components'];
        return self.filesIgnoredBy.gitignore
          .concat([
            '.gitignore',
            '.npmignore',
            '.babelrc',
            '.npmrc',
            ...Object.keys(self.project.linter.lintFiles),
            config.file.devDependencies_json,
            ...// TODO or taon json
            (Helpers.exists(self.project.pathFor(config.file.taon_jsonc))
              ? [config.file.package_json]
              : []),
            // 'docs',
            'logo.svg',
            // ...(self.project.isWorkspace ? self.project.children.map(c => c.name) : [])
          ])
          .map(f => (f.startsWith('/') ? f.slice(1) : f))
          .map(f => `**/${f}`);
        // .filter(f => {
        //   // console.log('f',siteFiles)
        //   if (self.project.isSiteInStrictMode && siteFiles.includes(f)) {
        //     return false
        //   }
        //   return true;
        // })
      },
      get gitignore() {
        const gitignoreFiles = [
          // for sure ingored
          config.folder.node_modules,
          'tmp*',
          'dist*',
          'bundle*',
          'browser',
          'browser*',
          'websql',
          'websql*',
          'module*',
          'backup',
          'module',
          'www',
        ]
          .concat(
            [
              // common small files
              'Thumbs.db',
              '.DS_Store',
              '**/.DS_Store',
              'npm-debug.log*',
            ]
              .concat([
                // not sure if ignored/needed
                '.sass-cache',
                '.sourcemaps',
              ])
              .concat(
                self.project.artifactsManager.artifact.npmLibAndCliTool.filesRecreator
                  .__filesTemplates()
                  .map(f => f.replace('.filetemplate', '')),
              ),
          )
          .concat(
            // core files of projects types
            !self.project.framework.isCoreProject
              ? []
              : [config.folder.src, config.folder.components].map(
                  f => `${f}-for-stanalone`,
                ),
          )
          .concat(['projects/tmp*'])
          .concat(['tsconfig.backend.dist.json']);
        // .concat(self.project.framework.isContainer ? [
        //   ...(self.project.children.filter(c => c.git.isInsideGitRepo).map(c => c.name))
        // ] : []);

        // console.log('self.project:', self.project.name);
        // console.log(gitignoreFiles)
        return gitignoreFiles.map(f => `/${crossPlatformPath(f)}`);
      },
      get npmignore() {
        const allowedProject: CoreModels.LibType[] = ['isomorphic-lib'];
        // const canBeUseAsNpmPackage = self.project.typeIs(...allowedProject);
        const npmignoreFiles = [
          '.vscode',
          '/dist',
          '/src',
          '/app',
          '/source',
          '/docs',
          '/preview',
          '/tests',
          'tsconfig.json',
          'npm-debug.log*',
        ];

        return npmignoreFiles.map(f => crossPlatformPath(f));
      },
    };
    //#endregion
  }
  //#endregion

  //#region modifyVscode function
  public modifyVscode(
    modifyFN: (
      settings: CoreModels.VSCodeSettings,
      project?: Project,
    ) => CoreModels.VSCodeSettings,
  ) {
    //#region @backendFunc
    const pathSettingsVScode = path.join(
      this.project.location,
      '.vscode',
      'settings.json',
    );

    Helpers.log('[modifyVscode] setting things...');
    if (Helpers.exists(pathSettingsVScode)) {
      try {
        Helpers.log('parsing 1 ...');
        let settings: CoreModels.VSCodeSettings = JSON5.parse(
          Helpers.readFile(pathSettingsVScode),
        );
        settings = modifyFN(settings, this.project);
        Helpers.writeFile(pathSettingsVScode, settings);
      } catch (e) {
        Helpers.log(e);
      }
    } else {
      try {
        Helpers.log('parsing 2...');
        const settingFromCore = path.join(
          this.project.ins.by(this.project.type).location,
          '.vscode',
          'settings.json',
        );
        Helpers.mkdirp(path.dirname(pathSettingsVScode));
        if (Helpers.exists(settingFromCore)) {
          var settings: CoreModels.VSCodeSettings = JSON5.parse(
            Helpers.readFile(settingFromCore),
          );
          settings = modifyFN(settings, this.project);
          Helpers.writeFile(pathSettingsVScode, settings);
        }
      } catch (e) {
        Helpers.log(e);
      }
    }
    //#endregion
  }
  //#endregion

  //#region handle vscode settings
  get vscode() {
    //#region @backendFunc
    const self = this;
    return {
      get settings() {
        return {
          toogleHideOrShowDeps() {
            let action: 'hide' | 'show' | 'nothing';
            self.modifyVscode(settings => {
              settings['search.useIgnoreFiles'] = false;
              settings['search.include'] = ['**/src/**'];
              settings['search.exclude'] = {
                bin: true,
                local_release: true,
                node_modules: true,
                '.build': true,
                '.vscode': true,
                browser: true,
                dist: true,
                'package-lock.json': true,
                'tmp-*': true,
                'src/lib/env/**/*.*': true,
              };

              frameworkBuildFolders.forEach(f => {
                settings['search.exclude'][f] = true;
              });

              Object.keys(settings['search.exclude']).forEach(k => {
                settings['search.exclude'][`**/${k}`] = true;
              });

              settings['search.exclude']['projects'] = true;

              if (!settings['files.exclude']) {
                settings['files.exclude'] = {};
              }
              if (Object.keys(settings['files.exclude']).length === 0) {
                action = 'show';
              } else {
                action = 'hide';
              }
              return settings;
            });
            if (action === 'hide') {
              Helpers.log(`Auto hiding while init`);
              self.vscode.settings.hideOrShowFilesInVscode(true);
            }
            if (action === 'show') {
              Helpers.log(`Auto showing while init`);
              self.vscode.settings.hideOrShowFilesInVscode(false);
            }
          },
          gitReset() {
            try {
              self.project
                .run('git checkout HEAD -- .vscode/settings.json')
                .sync();
            } catch (e) {}
          },
          changeColorTheme(white = true) {
            self.modifyVscode(settings => {
              settings['workbench.colorTheme'] = white
                ? 'Default Light+'
                : 'Kimbie Dark';
              return settings;
            });
          },
          hideOrShowFilesInVscode(hide: boolean = true) {
            self.modifyVscode(settings => {
              settings['files.exclude'] = {};

              const getSettingsFor = (project: Project, s = {}) => {
                s['files.exclude'] = {};

                s['files.exclude'][`**/*____ORIGINAL____.ts`] = true;
                s['files.exclude'][`_changelog`] = true;

                // s['files.exclude']['tsconfig.backend.dist.json'] = true;
                // s['files.exclude']['tsconfig.backend.dist.json.filetemplate'] =
                //   true;

                // s['files.exclude']["*.js"] = true;
                // s['files.exclude']["environment.js"] = false;
                s['files.exclude']['*.sh'] = true;
                s['files.exclude']['*.xlsx'] = true;
                s['files.exclude']['scripts'] = true;
                // s['files.exclude']["bin"] = true;

                [...self.filesIgnoredBy.vscodeSidebarFilesView].map(f => {
                  s['files.exclude'][f] = true;
                });
                if (!project.framework.isCoreProject) {
                  for (const element of frameworkBuildFolders) {
                    s['files.exclude'][element] = true;
                  }

                  s['files.exclude']['**/*.filetemplate'] = true;
                  s['files.exclude']['**/tsconfig.*'] = true;
                  s['files.exclude']['**/tslint.*'] = true;
                  // s['files.exclude']['**/index.*'] = true;
                  s['files.exclude']['**/recent.json'] = true;
                  s['files.exclude']['**/angular.json'] = true;
                  s['files.exclude']['**/webpack*'] = true;
                  s['files.exclude']['**/run-*'] = true;
                  s['files.exclude']['**/run.*'] = true;
                  s['files.exclude']['**/package-lock.json'] = true;
                  s['files.exclude']['**/protractor.conf.js'] = true;
                  s['files.exclude']['**/karma.conf.js'] = true;
                  s['files.exclude']['**/.editorconfig'] = true;
                  s['files.exclude']['**/eslint.config.js'] = true;
                  s['files.exclude']['**/update-vscode-package-json.js'] = true;
                  s['files.exclude']['**/.eslintrc.json'] = true;
                  s['files.exclude'][
                    `**/${project.artifactsManager.artifact.docsWebapp.docs.docsConfigSchema}`
                  ] = true;

                  s['files.exclude'][`**/${taonConfigSchemaJsonStandalone}`] =
                    true;
                  s['files.exclude'][`**/${taonConfigSchemaJsonContainer}`] =
                    true;

                  Object.keys(project.linter.lintFiles).forEach(f => {
                    s['files.exclude'][`**/${f}`] = true;
                  });
                  project.vsCodeHelpers.__vscodeFileTemplates.forEach(f => {
                    s['files.exclude'][f.replace('.filetemplate', '')] = false;
                  });

                  ['index.js', 'index.d.ts', 'index.js.map'].forEach(
                    indexFile => {
                      s['files.exclude'][`**/${indexFile}`] = true;
                    },
                  );
                }
                return s;
              };

              if (hide) {
                settings = getSettingsFor(self.project, settings) as any;
                if (self.project.framework.isContainer) {
                  settings['files.exclude'][`recent.json`] = true;
                  settings['files.exclude'][`angular.json`] = true;
                  // settings['files.exclude'][`src/lib`] = true;

                  // self.project.children.forEach(c => {
                  //   const childernSettings = getSettingsFor(c);
                  //   Object.keys(childernSettings['files.exclude']).forEach(
                  //     k => {
                  //       settings['files.exclude'][`${c.name}/${k}`] =
                  //         childernSettings['files.exclude'][k];
                  //     },
                  //   );
                  //   settings['files.exclude'][`${c.name}/tsconfig*`] = true;
                  //   settings['files.exclude'][`${c.name}/webpack*`] = true;
                  //   settings['files.exclude'][`${c.name}/index*`] = true;
                  //   settings['files.exclude'][`${c.name}/run.js`] = true;
                  //   settings['files.exclude'][`${c.name}/run-org.js`] = true;

                  //   settings['files.exclude'][`${c.name}/src/index.ts`] = true;
                  //   settings['files.exclude'][`${c.name}/.vscode`] = true;
                  //   // settings['files.exclude'][`${c.name}/${config.file.package_json__tnp_json5}`] = true;
                  //   settings['files.exclude'][
                  //     `${c.name}/${config.file.package_json}`
                  //   ] = true;
                  //   // settings['files.exclude'][`${c.name}/src/lib`] = true;
                  //   // settings['files.exclude'][`${c.name}/README.md`] = true;
                  //   settings['files.exclude'][`${c.name}/karma.conf.js*`] =
                  //     true;
                  //   settings['files.exclude'][`${c.name}/protractor.conf.js*`] =
                  //     true;
                  //   c.__filesTemplates().forEach(t => {
                  //     settings['files.exclude'][`${c.name}/${t}`] = true;
                  //     settings['files.exclude'][
                  //       `${c.name}/${t.replace('.filetemplate', '')}`
                  //     ] = true;
                  //   });
                  // });
                }
              }
              // settings['files.exclude'][config.folder.tmpTestsEnvironments] = false;

              // QUICK FIX FOR BROWSER
              delete settings['files.exclude']['**/browser*'];
              delete settings['files.exclude']['**/bundle*'];

              return settings;
            });
          },
        };
      },
    };
    //#endregion
  }
  //#endregion

  //#region handle npm ignore
  npmignore() {
    //#region @backendFunc
    Helpers.writeFile(
      path.join(this.project.location, '.npmignore'),
      this.filesIgnoredBy.npmignore.join('\n').concat('\n'),
    );
    //#endregion
  }
  //#endregion

  //#region handle git ignore
  gitignore() {
    //#region @backendFunc
    const ignoredByGit = this.filesIgnoredBy.gitignore
      .filter(f => !f.startsWith('/tsconfig'))
      .filter(f => {
        if (
          this.project.framework.isCoreProject &&
          f.endsWith('.filetemplate')
        ) {
          return false;
        }
        return true;
      })
      .join('\n')
      .concat('\n');
    // console.log(ignoredByGit)
    const linkeProjectPrefix =
      this.project.linkedProjects.getLinkedProjectsConfig().prefix;
    const patternsToIgnore =
      `# profiling files
chrome-profiler-events*.json
speed-measure-plugin*.json

# misc
/.sass-cache
/**/tmp-*
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings
app.hosts.ts
/src/vars.scss
${frameworkBuildFolders
  .filter(c => !!c)
  .map(c => `/${c}`)
  .join('\n')}
/${this.project.artifactsManager.artifact.docsWebapp.docs.docsConfigSchema}
/**/BUILD-INFO.md
${this.project.framework.isStandaloneProject ? `/${config.folder.testsEnvironments}` : ''}
/src/lib/lib-info.md
/src/lib/env/**/*.*
/src/migrations/migrations-info.md
/src/tests/mocha-tests-info.md
/src/assets/shared/shared_folder_info.txt
.vscode/launch.json

# System Files
.DS_Store
Thumbs.db
` +
      ignoredByGit +
      `
!tsconfig*
!webpack.*
${
  this.project.linkedProjects.linkedProjects.length > 0 ||
  !!this.project.linkedProjects.linkedProjectsPrefix
    ? `
# container/workspace git projects
# PREFIX
${linkeProjectPrefix ? `/${linkeProjectPrefix}*` : ''}
# LINKED PROJECTS
${
  this.project.isMonorepo
    ? []
    : this.project.linkedProjects.linkedProjects
        .map(f => f.relativeClonePath)
        .map(c => `/${crossPlatformPath(c)}`)
        .join('\n')
}
`
    : []
}
# =====================
!taon.jsonc
${this.project.framework.isCoreProject ? '!*.filetemplate' : '*.filetemplate'}
/*.sqlite
/*.rest

  `.trim() +
      '\n';

    Helpers.writeFile(
      path.join(this.project.location, '.gitignore'),
      patternsToIgnore,
    );
    // console.log({ patternsToIgnore })
    // Helpers.logInfo(`Updated .gitignore file for ${this.project.genericName}`);
    //#endregion
  }
  //#endregion

  //#region handle project specyfic files
  handleProjectSpecyficFiles() {
    //#region @backendFunc
    let defaultProjectProptotype: Project;

    defaultProjectProptotype = this.project.ins.by(
      this.project.type,
      this.project.framework.frameworkVersion,
    ) as Project;

    const files: RecreateFile[] = [];

    if (
      crossPlatformPath(this.project.location) ===
      crossPlatformPath(defaultProjectProptotype?.location)
    ) {
      // nothing
    } else if (defaultProjectProptotype) {
      const projectSpecyficFiles =
        this.project.artifactsManager.artifact.npmLibAndCliTool.filesRecreator.projectSpecyficFiles();
      // console.log({
      //   projectSpecyficFiles,
      //   project: this.project.genericName
      // })
      projectSpecyficFiles.forEach(relativeFilePath => {
        relativeFilePath = crossPlatformPath(relativeFilePath);

        let from = crossPlatformPath(
          path.join(defaultProjectProptotype.location, relativeFilePath),
        );

        // console.log({ relativeFilePath, from });

        if (!Helpers.exists(from)) {
          if (
            defaultProjectProptotype.framework.frameworkVersionAtLeast('v2')
          ) {
            const notExistedTaonVersions = ['v17'];
            if (
              !notExistedTaonVersions.includes(
                // non existed taon versions here
                defaultProjectProptotype.framework.frameworkVersionMinusOne,
              )
            ) {
              const core = this.project.ins.by(
                defaultProjectProptotype.type,
                defaultProjectProptotype.framework.frameworkVersionMinusOne,
              );
              from = crossPlatformPath(
                path.join(core.location, relativeFilePath),
              );
            }
          }
        }

        const where = crossPlatformPath(
          path.join(this.project.location, relativeFilePath),
        );

        files.push({
          from,
          where,
        });
      });

      files.forEach(file => {
        Helpers.copyFile(file.from, file.where);
      });
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / project source files
  /**
   * TODO
   */
  public __projectSourceFiles(): string[] {
    //#region @backendFunc
    if (this.project.typeIs('unknown')) {
      return [];
    }
    // TODO should be abstract
    return [
      ...this.__filesTemplates(),
      ...this.__filesTemplates().map(f =>
        f.replace(`.${config.filesExtensions.filetemplate}`, ''),
      ),
      ...this.projectSpecyficFiles(),
    ];
    //#endregion
  }
  //#endregion

  //#region getters & methods / files templates
  /**
   * Generated automaticly file templates exmpale:
   * file.ts.filetemplate -> will generate file.ts
   * inside triple bracked: {{{  ENV. }}}
   * property ENV can be used to check files
   */
  public __filesTemplates(): string[] {
    //#region @backendFunc
    // TODO should be abstract
    let templates = [];

    if (this.project.typeIs('isomorphic-lib')) {
      templates = [
        'tsconfig.json.filetemplate',
        'tsconfig.backend.dist.json.filetemplate',
      ];

      if (this.project.framework.frameworkVersionAtLeast('v2')) {
        templates = [
          'tsconfig.isomorphic.json.filetemplate',
          'tsconfig.isomorphic-flat-dist.json.filetemplate',
          'tsconfig.browser.json.filetemplate',
          ...this.project.vsCodeHelpers.__vscodeFileTemplates,
          ...templates,
        ];
      }

      if (this.project.framework.frameworkVersionAtLeast('v3')) {
        templates = templates.filter(f => !this.__ignoreInV3.includes(f));
      }
    }

    return templates;
    //#endregion
  }
  //#endregion
}
