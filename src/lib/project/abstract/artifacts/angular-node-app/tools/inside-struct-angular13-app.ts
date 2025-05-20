//#region imports
import { config } from 'tnp-config/src';
import { crossPlatformPath, path, _, CoreModels } from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';

import { EnvOptions } from '../../../../../options';
import type { Project } from '../../../project';
import { InsideStruct } from '../../npm-lib-and-cli-tool/tools/inside-structures/inside-struct';
import { BaseInsideStruct } from '../../npm-lib-and-cli-tool/tools/inside-structures/structs/base-inside-struct';
import { resolvePathToAsset as transformConfigLoaderPathToAssets } from '../../npm-lib-and-cli-tool/tools/inside-structures/structs/inside-struct-helpers';
import { imageLoader as getImageLoaderHtml } from '../../npm-lib-and-cli-tool/tools/inside-structures/structs/loaders/image-loader';
import { getLoader } from '../../npm-lib-and-cli-tool/tools/inside-structures/structs/loaders/loaders';

//#endregion

export class InsideStructAngular13App extends BaseInsideStruct {
  constructor(project: Project, initOptions: EnvOptions) {
    super(project, initOptions);
    //#region @backend
    if (
      !project.framework.frameworkVersionAtLeast('v4') ||
      project.typeIsNot('isomorphic-lib')
    ) {
      return;
    }
    const tmpProjectsStandalone =
      `tmp-apps-for-${config.folder.dist}` +
      `${this.initOptions.build.websql ? '-websql' : ''}/${project.name}`;

    const result = InsideStruct.from(
      {
        relateivePathesFromContainer: [
          //#region releative pathes from core project
          'app/src/app/app.component.html',
          'app/src/app/app.component.scss',
          // 'app/src/app/app.component.spec.ts', -> something better needed
          'app/src/app/app.component.ts',
          // 'app/src/app/app.module.ts',
          'app/src/environments/environment.prod.ts',
          'app/src/environments/environment.dev.ts',
          'app/src/environments/environment.ts',
          'app/src/app',
          'app/src/environments',
          'app/src/favicon.ico',
          'app/src/index.html',
          'app/src/main.ts',
          'app/src/polyfills.ts',
          'app/src/styles.scss',
          'app/src/jestGlobalMocks.ts',
          'app/src/setupJest.ts',
          // 'app/src/test.ts',  // node needed for jest test - (but the don' work wit symlinks)
          'app/src/manifest.webmanifest',
          'app/ngsw-config.json',
          'app/.browserslistrc',
          'app/.editorconfig',
          'app/.gitignore',
          // 'app/README.md',
          'app/angular.json',
          'app/jest.config.js',
          'app/electron-builder.json',
          'app/angular.webpack.js',
          'app/electron/main.js',
          `app/electron/${config.file.package_json}`,
          'app/karma.conf.js',
          'app/package-lock.json',
          `app/${config.file.package_json}`,
          'app/tsconfig.app.json',
          'app/tsconfig.json',
          'app/tsconfig.spec.json',
          //#endregion
        ],
        projectType: project.type,
        frameworkVersion: project.framework.frameworkVersion,
        pathReplacements: [
          [
            'app/',
            () => {
              return `${tmpProjectsStandalone}/`;
            },
          ],
        ],
        linkNodeModulesTo: ['app/'],
        linksFuncs: [
          //#region what and where needs to linked
          [
            opt => {
              const standalonePath =
                `tmp-src-app-${config.folder.dist}` +
                `${this.initOptions.build.websql ? '-websql' : ''}`;
              return standalonePath;
            },
            opt => {
              const standalonePath = `app/src/app/${this.project.name}`;
              return standalonePath;
            },
          ],
          //#endregion

          //#region link not containter target clients
          [
            opt => {
              const standalonePath =
                `tmp-src-${config.folder.dist}` +
                `${this.initOptions.build.websql ? '-websql' : ''}`;

              return '';
            },
            opt => {
              return '';
            },
          ],
          //#endregion

          //#region link not containter target clients - whole dist
          [
            opt => {
              return '';
            },
            opt => {
              return '';
            },
          ],
          //#endregion
        ],
        endAction: async ({ replacement }) => {
          //#region action after recreating/updating inside strcut

          //#region replace app.module.ts
          (() => {
            const appModuleFilePath = path.join(
              project.location,
              replacement(tmpProjectsStandalone),
              `/src/app/app.module.ts`,
            );

            let appModuleFile = Helpers.readFile(appModuleFilePath);

            const moduleName =
              _.upperFirst(_.camelCase(project.name)) + 'Module';
            appModuleFile = `
import { ${moduleName} } from './${this.project.name}/app';
${appModuleFile}
`;
            appModuleFile = appModuleFile.replace(
              '//<<<TO_REPLACE_MODULE>>>',
              `${moduleName},`,
            );

            const enableServiceWorker =
              this.initOptions.release.releaseType &&
              !initOptions.build.pwa.disableServiceWorker;

            if (enableServiceWorker) {
              // TODO it will colide with ng serve ?
              appModuleFile = appModuleFile.replace(
                new RegExp(
                  Helpers.escapeStringForRegEx('//distReleaseOnly'),
                  'g',
                ),
                '',
              );
            }

            Helpers.writeFile(appModuleFilePath, appModuleFile);
          })();
          //#endregion

          //#region replace app.component.ts
          (() => {
            const appComponentFilePath = path.join(
              project.location,
              replacement(tmpProjectsStandalone),
              `/src/app/app.component.ts`,
            );

            let appComponentFile = Helpers.readFile(appComponentFilePath);

            appComponentFile = appComponentFile.replace(
              `${'import'} { Taon } from 'taon';`,
              `${'import'} { Taon } from 'taon/${this.initOptions.build.websql ? config.folder.websql : config.folder.browser}';`,
            );

            appComponentFile = appComponentFile.replace(
              `${'import'} 'taon';`,
              `${'import'} 'taon/${this.initOptions.build.websql ? config.folder.websql : config.folder.browser}';`,
            );

            appComponentFile = appComponentFile.replace(
              `${'import'} start from './---projectname---/app';`,
              `${'import'} start from './${this.project.name}/app';`,
            );

            const componentName =
              _.upperFirst(_.camelCase(project.name)) + 'Component';
            appComponentFile = `
${'import'} { ${componentName} } from './${this.project.name}/app';
${appComponentFile}
`;

            appComponentFile = appComponentFile.replace(
              `'<<<TO_REPLACE_COMPONENT>>>'`,
              `${componentName}`,
            );

            Helpers.writeFile(appComponentFilePath, appComponentFile);
          })();
          //#endregion

          //#region replace app.module.ts
          (() => {
            const appComponentFilePath = path.join(
              project.location,
              replacement(tmpProjectsStandalone),
              `/src/app/app.module.ts`,
            );

            let appModuleFile = Helpers.readFile(appComponentFilePath);

            appModuleFile = appModuleFile.replace(
              `${'import'} { TaonAdminModeConfigurationModule } from 'taon';`,
              `${'import'} { TaonAdminModeConfigurationModule } from 'taon/${
                this.initOptions.build.websql
                  ? config.folder.websql
                  : config.folder.browser
              }';`,
            );

            Helpers.writeFile(appComponentFilePath, appModuleFile);
          })();
          //#endregion

          //#region replace main.ts websql things
          (() => {
            const appMainFilePath = path.join(
              project.location,
              replacement(tmpProjectsStandalone),
              `/src/main.ts`,
            );

            let appMainFile = Helpers.readFile(appMainFilePath);

            if (!this.initOptions.build.websql) {
              appMainFile = appMainFile.replace(
                `require('sql.js');`,
                `(arg: any) => {
                console.error('This should not be available in non-sql mode');
                return void 0;
              };`,
              );
            }

            appMainFile = appMainFile.replace(
              `${'import'} { Helpers } from 'tnp-core';`,
              `${'import'} { Helpers } from 'tnp-core/${this.initOptions.build.websql ? config.folder.websql : config.folder.browser}';`,
            );

            appMainFile = appMainFile.replace(
              `${'import'} { TaonAdmin } from 'taon';`,
              `${'import'} { TaonAdmin } from 'taon/${this.initOptions.build.websql ? config.folder.websql : config.folder.browser}';`,
            );

            appMainFile = appMainFile.replace(
              `${'import'} { Stor } from 'taon-storage';`,
              `${'import'} { Stor } from 'taon-storage/${this.initOptions.build.websql ? config.folder.websql : config.folder.browser}';`,
            );

            Helpers.writeFile(appMainFilePath, appMainFile);
          })();
          //#endregion

          //#region LOADERS & BACKGROUNDS REPLACEMENT
          (() => {
            const frontendBaseHref =
              this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
                this.initOptions,
              );

            //#region LOADERS & BACKGROUNDS REPLACEMENT / replace app.component.html loader
            (() => {
              const appModuleHtmlPath = path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/src/app/app.component.html`,
              );

              let appHtmlFile = Helpers.readFile(appModuleHtmlPath);

              const loaderData =
                this.initOptions.loading.afterAngularBootstrap.loader;
              const loaderIsImage = _.isString(loaderData);

              if (loaderIsImage) {
                const pathToAsset =
                  frontendBaseHref +
                  transformConfigLoaderPathToAssets(this.project, loaderData);

                appHtmlFile = appHtmlFile.replace(
                  '<!-- <<<TO_REPLACE_LOADER>>> -->',
                  getImageLoaderHtml(pathToAsset, false),
                );
              } else {
                const loaderToReplace = getLoader(
                  loaderData?.name as any,
                  loaderData?.color,
                  false,
                );
                appHtmlFile = appHtmlFile.replace(
                  '<!-- <<<TO_REPLACE_LOADER>>> -->',
                  loaderToReplace,
                );
              }

              Helpers.writeFile(appModuleHtmlPath, appHtmlFile);
            })();
            //#endregion

            //#region LOADERS & BACKGROUNDS REPLACEMENT / replace app.component.ts body  background color
            (() => {
              const appModuleFilePath = path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/src/app/app.component.ts`,
              );

              let appScssFile = Helpers.readFile(appModuleFilePath);

              const bgColor =
                this.initOptions.loading.afterAngularBootstrap.background;

              if (bgColor) {
                appScssFile = appScssFile.replace(
                  'TAON_TO_REPLACE_COLOR',
                  bgColor,
                );
              }
              Helpers.writeFile(appModuleFilePath, appScssFile);
            })();
            //#endregion

            //#region LOADERS & BACKGROUNDS REPLACEMENT / replace index.html body background color & loader
            (() => {
              const appModuleFilePath = path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/src/index.html`,
              );

              let indexHtmlFile = Helpers.readFile(appModuleFilePath);

              const loaderData =
                this.initOptions.loading.preAngularBootstrap.loader;

              const loaderIsImage = _.isString(loaderData);

              if (loaderIsImage) {
                const pathToAsset =
                  frontendBaseHref +
                  transformConfigLoaderPathToAssets(this.project, loaderData);

                indexHtmlFile = indexHtmlFile.replace(
                  '<!-- <<<TO_REPLACE_LOADER>>> -->',
                  getImageLoaderHtml(pathToAsset, true),
                );
              } else {
                const loaderToReplace = getLoader(
                  loaderData?.name as any,
                  loaderData?.color,
                  true,
                );
                indexHtmlFile = indexHtmlFile.replace(
                  '<!-- <<<TO_REPLACE_LOADER>>> -->',
                  loaderToReplace,
                );
              }

              const bgColor =
                this.initOptions.loading.preAngularBootstrap.background;

              const bgColorStyle = bgColor
                ? `style="background-color: ${bgColor};"`
                : '';
              indexHtmlFile = indexHtmlFile.replace(
                'TAON_TO_REPLACE_COLOR',
                bgColorStyle,
              );

              Helpers.writeFile(appModuleFilePath, indexHtmlFile);
            })();
            //#endregion
          })();
          //#endregion

          //#region replace app.component.html
          (() => {
            const indexHtmlFilePath = path.join(
              project.location,
              replacement(tmpProjectsStandalone),
              `/src/index.html`,
            );

            let indexHtmlFile = Helpers.readFile(indexHtmlFilePath);

            const title = this.initOptions.website.title;

            const titleToReplace = title
              ? title
              : _.startCase(this.project.name);
            // console.log({
            //   titleToReplace
            // })
            indexHtmlFile = indexHtmlFile.replace(
              '<title>App</title>',
              `<title>${titleToReplace}</title>`,
            );
            Helpers.writeFile(indexHtmlFilePath, indexHtmlFile);
          })();
          //#endregion

          //#region replace main.ts
          (() => {
            const mainFilePath = path.join(
              project.location,
              replacement(tmpProjectsStandalone),
              `/src/main.ts`,
            );
            this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.replaceBaseHrefInFile(
              mainFilePath,
              this.initOptions,
            );
          })();
          //#endregion

          //#region replace style.scss
          (() => {
            const stylesFilePath = path.join(
              project.location,
              replacement(tmpProjectsStandalone),
              `/src/styles.scss`,
            );
            this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.replaceBaseHrefInFile(
              stylesFilePath,
              this.initOptions,
            );
          })();
          //#endregion

          //#region replace favicon.ico
          (() => {
            const faviconPathDest = crossPlatformPath([
              project.location,
              replacement(tmpProjectsStandalone),
              `/src/favicon.ico`,
            ]);

            const source = crossPlatformPath([
              project.location,
              `/src/assets/favicon.ico`,
            ]);

            if (Helpers.exists(source)) {
              Helpers.copyFile(source, faviconPathDest);
            }
          })();
          //#endregion

          //#region link assets
          (() => {
            const assetsSource = crossPlatformPath(
              path.join(
                project.location,
                replacement(
                  `tmp-src-${config.folder.dist}${this.initOptions.build.websql ? '-websql' : ''}`,
                ),
                config.folder.assets,
              ),
            );

            if (!Helpers.exists(assetsSource)) {
              Helpers.mkdirp(assetsSource);
            }

            const assetsDest = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/src/assets`,
              ),
            );
            Helpers.remove(assetsDest);
            Helpers.createSymLink(assetsSource, assetsDest);
          })();
          //#endregion

          //#region electron
          (() => {
            const electronBackend = crossPlatformPath(
              path.join(project.location, replacement(config.folder.dist)),
            );

            if (!Helpers.exists(electronBackend)) {
              Helpers.mkdirp(electronBackend);
            }

            const compileTs = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/electron/compiled`,
              ),
            );
            Helpers.remove(compileTs);
            Helpers.createSymLink(electronBackend, compileTs);

            const electronConfigPath = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/electron-builder.json`,
              ),
            );

            const electronConfig = Helpers.readJson(electronConfigPath);
            electronConfig.directories.output =
              `../../` +
              `${this.project.artifactsManager.artifact.electronApp.__getElectronAppRelativePath(
                { websql: this.initOptions.build.websql },
              )}/`;

            Helpers.writeJson(electronConfigPath, electronConfig);
            const packageJson = new BasePackageJson({
              cwd: crossPlatformPath(
                path.join(
                  project.location,
                  replacement(tmpProjectsStandalone),
                  `/${config.file.package_json}`,
                ),
              ),
            });

            packageJson.setName(this.project.name);

            if (this.initOptions.release.releaseType) {
              packageJson.setMainProperty('electron/index.js');
            }
            packageJson.setVersion(this.project.packageJson.version);
          })();
          //#endregion

          //#region rebuild manifest + index.html
          await (async () => {
            const manifestJsonPath = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/src/manifest.webmanifest`,
              ),
            );

            const indexHtmlPath = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/src/index.html`,
              ),
            );

            const manifestJson: CoreModels.PwaManifest = Helpers.readJson(
              manifestJsonPath,
              {},
              true,
            );
            let indexHtml = Helpers.readFile(indexHtmlPath);

            manifestJson.name =
              this.initOptions.build.pwa.name || _.startCase(project.name);

            manifestJson.short_name =
              this.initOptions.build.pwa.short_name || project.name;

            const assetsPath = crossPlatformPath(
              path.join(
                project.location,
                config.folder.src,
                config.folder.assets,
              ),
            );

            if (this.project.artifactsManager.globalHelper.branding.exist) {
              //#region apply pwa generated icons
              manifestJson.icons =
                this.project.artifactsManager.globalHelper.branding.iconsToAdd;
              //#endregion
              indexHtml = indexHtml.replace(
                `<link rel="icon" type="image/x-icon" href="favicon.ico">`,
                '',
              );
              indexHtml = indexHtml.replace(
                this.project.artifactsManager.globalHelper.branding
                  .htmlIndexRepaceTag,
                this.project.artifactsManager.globalHelper.branding.htmlLinesToAdd.join(
                  '\n',
                ),
              );
              indexHtml = indexHtml.replace(
                `<link rel="icon" type="image/x-icon" href="/`,
                `<link rel="icon" type="image/x-icon" href="`,
              );
            } else {
              //#region apply default icons
              const iconsPath = crossPlatformPath(
                path.join(assetsPath, 'icons'),
              );

              const iconsFilesPathes = Helpers.filesFrom(iconsPath).filter(
                f => {
                  return CoreModels.ImageFileExtensionArr.includes(
                    path.extname(f as any).replace('.', '') as any,
                  );
                },
              ); // glob.sync(`${iconsPath}/**/*.(png|jpeg|svg)`);

              manifestJson.icons = iconsFilesPathes.map(f => {
                return {
                  src: f.replace(`${path.dirname(assetsPath)}/`, ''),
                  sizes: _.last(
                    path.basename(f).replace(path.extname(f), '').split('-'),
                  ),
                  type: `image/${path.extname(f).replace('.', '')}`,
                  purpose: 'maskable any',
                };
              });
              //#endregion
            }

            manifestJson.icons = manifestJson.icons.map(c => {
              c.src = c.src.replace(/^\//, '');
              return c;
            });

            if (this.initOptions.build.pwa.start_url) {
              manifestJson.start_url = this.initOptions.build.pwa.start_url;
            } else if (this.initOptions.website.useDomain) {
              manifestJson.start_url = `https://${this.initOptions.website.domain}/`;
            } else {
              manifestJson.start_url = `/${this.project.name}/`; // perfect for github.io OR when subdomain myproject.com/docs/
            }

            Helpers.writeJson(manifestJsonPath, manifestJson);
            Helpers.writeFile(indexHtmlPath, indexHtml);
          })();
          //#endregion

          //#region replace base href

          (() => {
            const angularJsonPath = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/angular.json`,
              ),
            );
            Helpers.setValueToJSON(
              angularJsonPath,
              'projects.app.architect.build.options.baseHref',
              this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
                this.initOptions,
              ),
            );
          })();
          //#endregion

          //#region inject environment => done throught reading json
          (() => {
            // const indexHtml = crossPlatformPath(path.join(
            //   project.location
            //   ,
            //   (project.framework.isStandaloneProject ? tmpProjectsStandalone : tmpProjects)
            //   ,
            //   `/src/index.html`
            // ));
            // const $ = cheerio.load(Helpers.readFile(indexHtml));
            // $('body').append(`
            // <script>
            // if (global === undefined) {
            //   var global = window;
            // }
            // var ENV = ${JSON.stringify(project.env.config)};
            // window.ENV = ENV;
            // global.ENV = ENV;
            // </script>
            // `);
            // Helpers.writeFile(indexHtml, $.html())
          })();
          //#endregion

          //#region add proper pathes to tsconfig
          (() => {
            const tsconfigJSONpath = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/tsconfig.json`,
              ),
            );

            const libsPathes = crossPlatformPath(
              path.join(project.location, `src/libs`),
            );

            const content = Helpers.readJson(tsconfigJSONpath, void 0, true);

            let libs = Helpers.linksToFoldersFrom(libsPathes);
            const parentPath = crossPlatformPath(
              path.resolve(path.join(project.location, '../../..')),
            );

            const parent = this.project.ins.From(parentPath) as Project;
            if (parent && libs.length > 0 && content.compilerOptions) {
              // console.log('tsconfigJSON', tsconfigJSONpath, content)
              // console.log('libsPathes', libsPathes)
              // console.log(`libs`, libs)
              // console.log(`PARENT PATH: ${parentPath}  `)

              content.compilerOptions.paths = libs.reduce((a, b) => {
                const pathRelative = b
                  .replace(parent.location, '')
                  .split('/')
                  .slice(4)
                  .join('/')
                  .replace('src/', `src/app/${project.name}/`);
                return _.merge(a, {
                  [`@${parent.name}/${path.basename(b)}/${this.initOptions.build.websql ? config.folder.websql : config.folder.browser}`]:
                    [`./${pathRelative}`],
                  [`@${parent.name}/${path.basename(b)}/${this.initOptions.build.websql ? config.folder.websql : config.folder.browser}/*`]:
                    [`./${pathRelative}/*`],
                });
              }, {});
              Helpers.writeJson(tsconfigJSONpath, content);
            }

            // console.info(JSON.stringify(content.compilerOptions, null, 4))
          })();
          //#endregion

          //#endregion
        },
      },
      project,
    );

    this.struct = result;
    //#endregion
  }
}
