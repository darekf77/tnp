//#region imports
import { config, Utils } from 'tnp-core/src';
import { crossPlatformPath, path, _, CoreModels, fse } from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';

import { templateFolderForArtifact } from '../../../../../app-utils';
import {
  appFromSrc,
  appFromSrcInsideNgApp,
  assetsFromNgProj,
  assetsFromSrc,
  browserMainProject,
  CoreAssets,
  CoreNgTemplateFiles,
  distMainProject,
  electronNgProj,
  ngProjectStylesScss,
  packageJsonNgProject,
  packageJsonNpmLib,
  srcMainProject,
  srcNgProxyProject,
  TemplateFolder,
  tmpAppsForDist,
  tmpAppsForDistElectron,
  tmpAppsForDistElectronWebsql,
  tmpAppsForDistWebsql,
  tmpSrcAppDist,
  tmpSrcAppDistWebsql,
  tmpSrcDist,
  tmpSrcDistWebsql,
  tsconfigNgProject,
  websqlMainProject,
} from '../../../../../constants';
import { libs } from '../../../../../constants';
import { ReleaseArtifactTaon } from '../../../../../options';
import type { Project } from '../../../project';
import { InsideStruct } from '../../__helpers__/inside-structures/inside-struct';
import { BaseInsideStruct } from '../../__helpers__/inside-structures/structs/base-inside-struct';
import { resolvePathToAsset } from '../../__helpers__/inside-structures/structs/inside-struct-helpers';
import { imageLoader } from '../../__helpers__/inside-structures/structs/loaders/image-loader';
import { getLoader } from '../../__helpers__/inside-structures/structs/loaders/loaders';
//#endregion

export class InsideStructAngularApp extends BaseInsideStruct {
  getCurrentArtifact(): ReleaseArtifactTaon {
    return ReleaseArtifactTaon.ANGULAR_NODE_APP;
  }

  get isElectron(): boolean {
    return this.getCurrentArtifact() === ReleaseArtifactTaon.ELECTRON_APP;
  }

  private resolveTmpProjectStandalonePath(): string {
    if (this.initOptions.build.websql) {
      if (this.isElectron) {
        return tmpAppsForDistElectronWebsql + `/${this.project.name}`;
      } else {
        return tmpAppsForDistWebsql + `/${this.project.name}`;
      }
    } else {
      if (this.isElectron) {
        return tmpAppsForDistElectron + `/${this.project.name}`;
      } else {
        return tmpAppsForDist + `/${this.project.name}`;
      }
    }
  }

  insideStruct(): InsideStruct {

    //#region @backendFunc
    const project = this.project;
    const tmpProjectsStandalone = this.resolveTmpProjectStandalonePath();
    const templateFolderInCoreProject = templateFolderForArtifact(
      this.isElectron
        ? ReleaseArtifactTaon.ELECTRON_APP
        : ReleaseArtifactTaon.ANGULAR_NODE_APP,
    );

    const result = InsideStruct.from(
      {
        relateivePathesFromContainer: this.relativePaths(),
        projectType: project.type,
        frameworkVersion: project.framework.frameworkVersion,
        pathReplacements: [
          [
            new RegExp(
              `^${Utils.escapeStringForRegEx(
                templateFolderInCoreProject + '/',
              )}`,
            ),
            () => {
              return `${tmpProjectsStandalone}/`;
            },
          ],
        ],
        linkNodeModulesTo: [`${templateFolderInCoreProject}/`],
        linksFuncs: [

          //#region what and where needs to linked
          [
            // from this
            () => {
              const browserTsAppCode = this.initOptions.build.websql
                ? tmpSrcAppDistWebsql
                : tmpSrcAppDist;

              return browserTsAppCode;
            },
            // to this
            () => {
              const standalonePath = crossPlatformPath([
                templateFolderInCoreProject,
                srcNgProxyProject,
                appFromSrcInsideNgApp,
                this.project.name,
              ]);
              return standalonePath;
            },
          ],
          //#endregion

        ],
        endAction: async ({ replacement }) => {

          //#region @backendFunc

          //#region action after recreating/updating inside strcut
          (() => {
            [
              `/${srcNgProxyProject}/${appFromSrcInsideNgApp}/app.module.ts`,
            ].forEach(appModuleFileRelative => {
              const appModuleFilePath = path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                appModuleFileRelative,
              );

              let appModuleFile = Helpers.readFile(appModuleFilePath);

              const moduleName =
                _.upperFirst(_.camelCase(project.name)) + 'Module';
              appModuleFile = `
  import { ${moduleName} } from './${this.project.name}/${appFromSrcInsideNgApp}';
  ${appModuleFile}
  `;
              appModuleFile = appModuleFile.replace(
                '//<<<TO_REPLACE_MODULE>>>',
                `${moduleName},`,
              );

              appModuleFile = this.replaceImportsForBrowserOrWebsql(
                appModuleFile,
                {
                  websql: this.initOptions.build.websql,
                },
              );

              // const enableServiceWorker =
              //   !this.initOptions.build.angularSsr &&
              //   this.initOptions.release.releaseType &&
              //   !this.initOptions.build.pwa.disableServiceWorker;

              const enableServiceWorker =
                this.initOptions.release.releaseType &&
                !this.initOptions.build.pwa.disableServiceWorker;

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
            });
          })();
          //#endregion

          //#region replace app.component.ts
          (() => {
            const appComponentFilePath = path.join(
              project.location,
              replacement(tmpProjectsStandalone),
              `/${srcNgProxyProject}/${appFromSrcInsideNgApp}/app.component.ts`,
            );

            let appComponentFile = Helpers.readFile(appComponentFilePath);

            appComponentFile = this.replaceImportsForBrowserOrWebsql(
              appComponentFile,
              {
                websql: this.initOptions.build.websql,
              },
            );

            appComponentFile = appComponentFile.replace(
              `${'import'} start from './---projectname---/${appFromSrcInsideNgApp}';`,
              `${'import'} start from './${this.project.name}/${appFromSrcInsideNgApp}';`,
            );

            const componentName =
              _.upperFirst(_.camelCase(project.name)) + 'Component';
            appComponentFile = `
${'import'} { ${componentName} } from './${this.project.name}/${appFromSrcInsideNgApp}';
${appComponentFile}
`;

            appComponentFile = appComponentFile.replace(
              `'<<<TO_REPLACE_COMPONENT>>>'`,
              `${componentName}`,
            );

            Helpers.writeFile(appComponentFilePath, appComponentFile);
          })();
          //#endregion

          //#region replace sqljs-loader.ts
          (() => {
            [
              `/${srcNgProxyProject}/${CoreNgTemplateFiles.sqlJSLoaderTs}`,
            ].forEach(mainTsFileRelative => {
              const appMainFilePath = path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                mainTsFileRelative,
              );

              this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.replaceBaseHrefInFile(
                appMainFilePath,
                this.initOptions,
              );

              let appMainFile = Helpers.readFile(appMainFilePath);

              if (!this.initOptions.build.websql) {
                appMainFile = appMainFile.replace(
                  `${'req' + 'uire'}('sql.js');`,
                  `(arg: any) => {
                console.error('This should not be available in non-sql mode');
                return void 0;
              };`,
                );
              }

              appMainFile = this.replaceImportsForBrowserOrWebsql(appMainFile, {
                websql: this.initOptions.build.websql,
              });

              Helpers.writeFile(appMainFilePath, appMainFile);
            });
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
                `/${srcNgProxyProject}/${appFromSrcInsideNgApp}/app.component.html`,
              );

              let appHtmlFile = Helpers.readFile(appModuleHtmlPath);

              const loaderData =
                this.initOptions.loading.afterAngularBootstrap.loader;
              const loaderIsImage = _.isString(loaderData);

              if (loaderIsImage) {
                const pathToAsset =
                  frontendBaseHref +
                  resolvePathToAsset(this.project, loaderData);

                appHtmlFile = appHtmlFile.replace(
                  '<!-- <<<TO_REPLACE_LOADER>>> -->',
                  imageLoader(pathToAsset, false),
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
              const appComponentAbsFilePath = path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/${srcNgProxyProject}/${appFromSrcInsideNgApp}/app.component.ts`,
              );

              let appComponentFileContent = Helpers.readFile(
                appComponentAbsFilePath,
              );

              const bgColor =
                this.initOptions.loading.afterAngularBootstrap.background;

              appComponentFileContent = appComponentFileContent.replace(
                'TAON_TO_REPLACE_COLOR',
                bgColor || '',
              );

              Helpers.writeFile(
                appComponentAbsFilePath,
                appComponentFileContent,
              );
            })();
            //#endregion

            //#region LOADERS & BACKGROUNDS REPLACEMENT / replace index.html body background color & loader
            (() => {
              const appModuleFilePath = path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/${srcNgProxyProject}/index.html`,
              );

              let indexHtmlFile = Helpers.readFile(appModuleFilePath);

              const loaderData =
                this.initOptions.loading.preAngularBootstrap.loader;

              const loaderIsImage = _.isString(loaderData);

              if (loaderIsImage) {
                const pathToAsset =
                  frontendBaseHref +
                  resolvePathToAsset(this.project, loaderData);

                indexHtmlFile = indexHtmlFile.replace(
                  '<!-- <<<TO_REPLACE_LOADER>>> -->',
                  imageLoader(pathToAsset, true),
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
                bgColorStyle || '',
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
              `/${srcNgProxyProject}/index.html`,
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

          //#region replace style.scss
          (() => {
            const stylesFilePath = path.join(
              project.location,
              replacement(tmpProjectsStandalone),
              `/${srcNgProxyProject}/${ngProjectStylesScss}`,
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
              `/${srcNgProxyProject}/favicon.ico`,
            ]);

            const source = crossPlatformPath([
              project.location,
              `/${srcNgProxyProject}/${assetsFromNgProj}/favicon.ico`,
            ]);

            if (Helpers.exists(source)) {
              Helpers.copyFile(source, faviconPathDest);
            }
          })();
          //#endregion

          //#region link assets
          (() => {
            const browserTsCode = this.initOptions.build.websql
              ? tmpSrcDistWebsql
              : tmpSrcDist;

            const assetsSource = project.pathFor([
              replacement(browserTsCode),
              assetsFromSrc,
            ]);

            if (!Helpers.exists(assetsSource)) {
              Helpers.mkdirp(assetsSource);
            }

            const assetsDest = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/${srcNgProxyProject}/${assetsFromNgProj}`,
              ),
            );
            Helpers.remove(assetsDest);
            Helpers.createSymLink(assetsSource, assetsDest);
          })();
          //#endregion

          if (this.isElectron) {

            //#region electron
            (() => {
              const electronBackend = project.pathFor(
                replacement(distMainProject),
              );

              if (!Helpers.exists(electronBackend)) {
                Helpers.mkdirp(electronBackend);
              }

              const compileTs = crossPlatformPath(
                path.join(
                  project.location,
                  replacement(tmpProjectsStandalone),
                  `/${electronNgProj}/compiled`,
                ),
              );
              try {
                fse.unlinkSync(compileTs);
              } catch (error) {
                Helpers.remove(compileTs);
              }
              Helpers.createSymLink(electronBackend, compileTs);

              const packageJson = new BasePackageJson({
                cwd: crossPlatformPath(
                  path.join(
                    project.location,
                    replacement(tmpProjectsStandalone),
                    `/${packageJsonNgProject}`,
                  ),
                ),
              });

              packageJson.setName(this.project.name);

              if (this.initOptions.release.releaseType) {
                packageJson.setMainProperty(`${electronNgProj}/index.js`);
              }
              packageJson.setVersion(this.project.packageJson.version);
            })();
            //#endregion

            (() => {
              const appModuleFilePath = path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/${srcNgProxyProject}/index.html`,
              );

              let indexHtmlFile = Helpers.readFile(appModuleFilePath);

              indexHtmlFile = indexHtmlFile.replace(
                '<link rel="manifest" href="manifest.webmanifest">',
                '',
              );

              Helpers.writeFile(appModuleFilePath, indexHtmlFile);
            })();
          }

          //#region rebuild manifest + index.html
          await (async () => {
            const manifestJsonPath = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/${srcNgProxyProject}/manifest.webmanifest`,
              ),
            );

            const indexHtmlPath = crossPlatformPath(
              path.join(
                project.location,
                replacement(tmpProjectsStandalone),
                `/${srcNgProxyProject}/index.html`,
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

            const assetsPath = project.pathFor([srcMainProject, assetsFromSrc]);

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
                `/${CoreNgTemplateFiles.ANGULAR_JSON}`,
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
                `/${tsconfigNgProject}`,
              ),
            );

            const librariesPaths = crossPlatformPath(
              path.join(project.location, `${srcMainProject}/${libs}`),
            );

            const content = Helpers.readJson(tsconfigJSONpath, void 0, true);

            let libraries = Helpers.linksToFoldersFrom(librariesPaths);
            const parentPath = crossPlatformPath(
              path.resolve(path.join(project.location, '../../..')),
            );

            const parent = this.project.ins.From(parentPath) as Project;
            if (parent && libraries.length > 0 && content.compilerOptions) {
              // console.log('tsconfigJSON', tsconfigJSONpath, content)
              // console.log(`libraries`, libraries)
              // console.log(`PARENT PATH: ${parentPath}  `)

              content.compilerOptions.paths = libraries.reduce((a, b) => {
                const pathRelative = b
                  .replace(parent.location, '')
                  .split('/')
                  .slice(4)
                  .join('/')
                  .replace(
                    `${srcMainProject}/`,
                    `${srcMainProject}/${appFromSrc}/${project.name}/`,
                  );
                return _.merge(a, {
                  [`@${parent.name}/${path.basename(b)}/` +
                  `${this.initOptions.build.websql ? websqlMainProject : browserMainProject}`]:
                    [`./${pathRelative}`],
                  [`@${parent.name}/${path.basename(b)}/` +
                  `${this.initOptions.build.websql ? websqlMainProject : browserMainProject}/*`]:
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
    return result;
    //#endregion

  }
}