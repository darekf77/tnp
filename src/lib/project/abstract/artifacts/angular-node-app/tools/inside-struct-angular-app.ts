//#region imports
import { RegionRemover } from 'isomorphic-region-loader/src';
import { MagicRenamer, RenameRule } from 'magic-renamer/src';
import { config, TAGS, Utils, UtilsFilesFoldersSync } from 'tnp-core/src';
import { crossPlatformPath, path, _, CoreModels, fse } from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';

import { templateFolderForArtifact } from '../../../../../app-utils';
import {
  AngularJsonTaskName,
  appFromSrc,
  appFromSrcInsideNgApp,
  assetsFromNgProj,
  assetsFromSrc,
  browserMainProject,
  CoreAssets,
  CoreNgTemplateFiles,
  distMainProject,
  electronNgProj,
  externalLibsFromNgProject,
  indexJSElectronDist,
  libFromNgProject,
  libFromSrc,
  migrationsFromSrc,
  myLibFromNgProject,
  ngProjectStylesScss,
  packageJsonNgProject,
  packageJsonNpmLib,
  projectsFromNgTemplate,
  sourceLinkInNodeModules,
  srcMainProject,
  srcNgProxyProject,
  TaonGeneratedFolders,
  TemplateFolder,
  tmpAppsForDist,
  tmpAppsForDistElectron,
  tmpAppsForDistElectronWebsql,
  tmpAppsForDistWebsql,
  tmpLibsForDist,
  tmpLibsForDistWebsql,
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

    const tmpProjectsStandalone = this.resolveTmpProjectStandalonePath();
    const templateFolderInCoreProject = templateFolderForArtifact(
      this.isElectron
        ? ReleaseArtifactTaon.ELECTRON_APP
        : ReleaseArtifactTaon.ANGULAR_NODE_APP,
    );

    const result = InsideStruct.from(
      {
        relateivePathesFromContainer: this.relativePaths(),
        projectType: this.project.type,
        frameworkVersion: this.project.framework.frameworkVersion,
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
              ]);
              return standalonePath;
            },
          ],
          //#endregion
        ],
        endAction: async ({ replacement }) => {
          //#region @backendFunc

          //#region DONE - replacing ProjectName everywher
          (() => {
            const magicRenameRules = `ProjectName->${_.upperFirst(_.camelCase(this.project.name))}`;

            // const filesToProcess = UtilsFilesFoldersSync.getFilesFrom([
            //   project.location,
            //   replacement(tmpProjectsStandalone),
            //   srcNgProxyProject,
            // ]).filter(f => {
            //   return f.endsWith('.ts');
            // });
            const base = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              srcNgProxyProject,
            ]);

            const filesToProcess = ['main.ts', 'main.server.ts'].map(rel =>
              crossPlatformPath([base, rel]),
            );

            for (const destinationAbsPath of filesToProcess) {
              // console.log({
              //   magicRenameRules,
              //   destinationAbsPath,
              // });

              let content = Helpers.readFile(destinationAbsPath);
              const [fromReplace, toReplace] = magicRenameRules.split('->');
              content = content.replace(
                new RegExp(Utils.escapeStringForRegEx(fromReplace), 'g'),
                toReplace,
              );

              if (!this.initOptions.build.websql) {
                const regionsToRemove = [TAGS.WEBSQL_ONLY];
                content = RegionRemover.from(
                  destinationAbsPath,
                  content,
                  regionsToRemove,
                  this.project,
                ).output;
              }

              content = content.replace(
                '<<<TO_REPLACE_CURRENT_PROJECT_GENERIC_NAME>>>',
                btoa(path.dirname(this.project.location)) +
                  '___' +
                  this.project.nameForNpmPackage,
              );

              // const rules = RenameRule.from(magicRenameRules);
              // for (const rule of rules) {
              //   content = rule.replaceInString(content);
              // }
              Helpers.writeFile(destinationAbsPath, content);
            }
          })();
          //#endregion

          // @DEPRECATED - TODO only ssr pwa
          //#region action after recreating/updating inside strcut
          //         (() => {
          //           [
          //             `/${srcNgProxyProject}/${appFromSrcInsideNgApp}/app.module.ts`,
          //           ].forEach(appModuleFileRelative => {
          //             const appModuleFilePath = path.join(
          //               project.location,
          //               replacement(tmpProjectsStandalone),
          //               appModuleFileRelative,
          //             );

          //             let appModuleFile = Helpers.readFile(appModuleFilePath);

          //             const moduleName =
          //               _.upperFirst(_.camelCase(project.name)) + 'Module';
          //             appModuleFile = `
          // import { ${moduleName} } from './${this.project.name}/${appFromSrcInsideNgApp}';
          // ${appModuleFile}
          // `;
          //             appModuleFile = appModuleFile.replace(
          //               '//<<<TO_REPLACE_MODULE>>>',
          //               `${moduleName},`,
          //             );

          //             appModuleFile = this.replaceImportsForBrowserOrWebsql(
          //               appModuleFile,
          //               {
          //                 websql: this.initOptions.build.websql,
          //               },
          //             );

          //             // const enableServiceWorker =
          //             //   !this.initOptions.build.angularSsr &&
          //             //   this.initOptions.release.releaseType &&
          //             //   !this.initOptions.build.pwa.disableServiceWorker;

          //             const enableServiceWorker =
          //               this.initOptions.release.releaseType &&
          //               !this.initOptions.build.pwa.disableServiceWorker;

          //             if (enableServiceWorker) {
          //               // TODO it will colide with ng serve ?
          //               appModuleFile = appModuleFile.replace(
          //                 new RegExp(
          //                   Helpers.escapeStringForRegEx('//distReleaseOnly'),
          //                   'g',
          //                 ),
          //                 '',
          //               );
          //             }

          //             Helpers.writeFile(appModuleFilePath, appModuleFile);
          //           });
          //         })();
          //#endregion

          //#region DONE - replace sqljs-loader.ts - replace TO_REPLACE_BASENAME
          (() => {
            const sqlJsLoadFileAbsPath = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              srcNgProxyProject,
              CoreNgTemplateFiles.sqlJSLoaderTs,
            ]);

            this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.replaceBaseHrefInFile(
              sqlJsLoadFileAbsPath,
              this.initOptions,
            );

            let sqlJSFileContent = Helpers.readFile(sqlJsLoadFileAbsPath);

            sqlJSFileContent = this.replaceImportsForBrowserOrWebsql(
              sqlJSFileContent,
              {
                websql: this.initOptions.build.websql,
              },
            );

            Helpers.writeFile(sqlJsLoadFileAbsPath, sqlJSFileContent);
            // });
          })();
          //#endregion

          //#region TODO - LOADERS & BACKGROUNDS REPLACEMENT
          (() => {
            const frontendBaseHref =
              this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
                this.initOptions,
              );
            //#region LOADERS & BACKGROUNDS REPLACEMENT / replace app.component.html loader
            // (() => {
            //   const appModuleHtmlPath = path.join(
            //     project.location,
            //     replacement(tmpProjectsStandalone),
            //     `/${srcNgProxyProject}/${appFromSrcInsideNgApp}/app.component.html`,
            //   );
            //   let appHtmlFile = Helpers.readFile(appModuleHtmlPath);
            //   const loaderData =
            //     this.initOptions.loading.afterAngularBootstrap.loader;
            //   const loaderIsImage = _.isString(loaderData);
            //   if (loaderIsImage) {
            //     const pathToAsset =
            //       frontendBaseHref +
            //       resolvePathToAsset(this.project, loaderData);
            //     appHtmlFile = appHtmlFile.replace(
            //       '<!-- <<<TO_REPLACE_LOADER>>> -->',
            //       imageLoader(pathToAsset, false),
            //     );
            //   } else {
            //     const loaderToReplace = getLoader(
            //       loaderData?.name as any,
            //       loaderData?.color,
            //       false,
            //     );
            //     appHtmlFile = appHtmlFile.replace(
            //       '<!-- <<<TO_REPLACE_LOADER>>> -->',
            //       loaderToReplace,
            //     );
            //   }
            //   Helpers.writeFile(appModuleHtmlPath, appHtmlFile);
            // })();
            //#endregion
            //#region LOADERS & BACKGROUNDS REPLACEMENT / replace app.component.ts body  background color
            // (() => {
            //   const appComponentAbsFilePath = path.join(
            //     project.location,
            //     replacement(tmpProjectsStandalone),
            //     `/${srcNgProxyProject}/${appFromSrcInsideNgApp}/app.component.ts`,
            //   );
            //   let appComponentFileContent = Helpers.readFile(
            //     appComponentAbsFilePath,
            //   );
            //   const bgColor =
            //     this.initOptions.loading.afterAngularBootstrap.background;
            //   appComponentFileContent = appComponentFileContent.replace(
            //     'TAON_TO_REPLACE_COLOR',
            //     bgColor || '',
            //   );
            //   Helpers.writeFile(
            //     appComponentAbsFilePath,
            //     appComponentFileContent,
            //   );
            // })();
            //#endregion
            //#region LOADERS & BACKGROUNDS REPLACEMENT / replace index.html body background color & loader
            (() => {
              const appModuleFilePath = path.join(
                this.project.location,
                replacement(tmpProjectsStandalone),
                `/${srcNgProxyProject}/${CoreNgTemplateFiles.INDEX_HTML_NG_APP}`,
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
                if (loaderData?.name) {
                  const loaderToReplace = getLoader(
                    loaderData?.name,
                    loaderData?.color,
                    // true,
                  );
                  indexHtmlFile = indexHtmlFile.replace(
                    '<!-- <<<TO_REPLACE_LOADER>>> -->',
                    loaderToReplace,
                  );
                }
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

          //#region DONE -  replace app.component.html
          (() => {
            const indexHtmlFilePath = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              srcNgProxyProject,
              CoreNgTemplateFiles.INDEX_HTML_NG_APP,
            ]);

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

          //#region DONE - replace style.scss
          (() => {
            const stylesFilePath = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              srcNgProxyProject,
              ngProjectStylesScss,
            ]);
            this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.replaceBaseHrefInFile(
              stylesFilePath,
              this.initOptions,
            );
          })();
          //#endregion

          //#region TODO (what I am doing here) .. replace favicon.ico
          (() => {
            const faviconPathDest = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              srcNgProxyProject,
              CoreNgTemplateFiles.FAVICON_ICO,
            ]);

            const source = crossPlatformPath([
              this.project.location,
              srcNgProxyProject,
              assetsFromNgProj,
              CoreNgTemplateFiles.FAVICON_ICO,
            ]);

            if (Helpers.exists(source)) {
              Helpers.copyFile(source, faviconPathDest);
            }
          })();
          //#endregion

          //#region link assets DONE
          (() => {
            const browserTsCode = this.initOptions.build.websql
              ? tmpSrcDistWebsql
              : tmpSrcDist;

            const assetsSource = this.project.pathFor([
              replacement(browserTsCode),
              assetsFromSrc,
            ]);

            if (!Helpers.exists(assetsSource)) {
              Helpers.mkdirp(assetsSource);
            }

            const assetsDest = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              srcNgProxyProject,
              assetsFromNgProj,
            ]);
            Helpers.remove(assetsDest);
            Helpers.createSymLink(assetsSource, assetsDest);
          })();
          //#endregion

          if (this.isElectron) {
            //#region electron DONE
            (() => {
              const electronBackend = this.project.pathFor(
                replacement(distMainProject),
              );
              if (!Helpers.exists(electronBackend)) {
                Helpers.mkdirp(electronBackend);
              }
              const compileTs = crossPlatformPath([
                this.project.location,
                replacement(tmpProjectsStandalone),
                electronNgProj,
                TaonGeneratedFolders.COMPILED,
              ]);

              try {
                fse.unlinkSync(compileTs);
              } catch (error) {
                Helpers.remove(compileTs);
              }
              Helpers.createSymLink(electronBackend, compileTs);
              const packageJson = new BasePackageJson({
                cwd: crossPlatformPath(
                  path.join(
                    this.project.location,
                    replacement(tmpProjectsStandalone),
                    `/${packageJsonNgProject}`,
                  ),
                ),
              });
              packageJson.setName(this.project.name);
              if (this.initOptions.release.releaseType) {
                packageJson.setMainProperty(
                  `${electronNgProj}/${indexJSElectronDist}`,
                );
              }
              packageJson.setVersion(this.project.packageJson.version);
            })();

            (() => {
              const appModuleFilePath = crossPlatformPath([
                this.project.location,
                replacement(tmpProjectsStandalone),
                srcNgProxyProject,
                CoreNgTemplateFiles.INDEX_HTML_NG_APP,
              ]);

              let indexHtmlFile = Helpers.readFile(appModuleFilePath);
              indexHtmlFile = indexHtmlFile.replace(
                '<link rel="manifest" href="manifest.webmanifest">',
                '',
              );
              Helpers.writeFile(appModuleFilePath, indexHtmlFile);
            })();
            //#endregion
          }

          //#region DONE rebuild manifest + index.html
          await (async () => {
            const manifestJsonPath = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              srcNgProxyProject,
              CoreNgTemplateFiles.WEBMANIFEST_JSON,
            ]);

            const indexHtmlPath = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              srcNgProxyProject,
              CoreNgTemplateFiles.INDEX_HTML_NG_APP,
            ]);

            const manifestJson: CoreModels.PwaManifest = Helpers.readJson(
              manifestJsonPath,
              {},
              true,
            );
            let indexHtml = Helpers.readFile(indexHtmlPath);

            manifestJson.name =
              this.initOptions.build.pwa.name || _.startCase(this.project.name);

            manifestJson.short_name =
              this.initOptions.build.pwa.short_name || this.project.name;

            const assetsPath = this.project.pathFor([
              srcMainProject,
              assetsFromSrc,
            ]);

            if (this.project.artifactsManager.globalHelper.branding.exist) {
              // apply pwa generated icons
              manifestJson.icons =
                this.project.artifactsManager.globalHelper.branding.iconsToAdd;

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
              // apply default icons
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

          //#region DONE replace base href
          (() => {
            const angularJsonPath = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              CoreNgTemplateFiles.ANGULAR_JSON,
            ]);

            Helpers.setValueToJSON(
              angularJsonPath, // TODO @LAST is here angular electron task needed ?
              `projects.${AngularJsonTaskName.ANGULAR_APP}.architect.build.options.baseHref`,
              this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
                this.initOptions,
              ),
            );
          })();
          //#endregion

          //#region recreate node_moduels libs for ng serve
          await (async () => {
            if (!this.initOptions.build.watch) {
              return;
            }
            // console.log('checking folders');
            // const isomorphicPackages =
            //   this.project.nodeModules.getIsomorphicPackagesNames();
            // console.log(isomorphicPackages);

            // 1. recreate projects/in-dev-packages-lib

            const isomorphicPackagesDevMode =
              this.project.nodeModules.getIsomorphicPackagesNamesInDevMode();
            // console.log(isomorphicPackagesDevMode);

            const tsconfigPath = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              tsconfigNgProject,
            ]);

            const existedMyLib = crossPlatformPath([
              this.project.location,
              replacement(tmpProjectsStandalone),
              projectsFromNgTemplate,
              myLibFromNgProject,
            ]);

            const ins = MagicRenamer.Instance(existedMyLib, true);
            const rule = `${myLibFromNgProject} => ${externalLibsFromNgProject}`;

            ins.start(rule, []);

            // 2. link src to in-dev-packages-lib

            for (
              let index = 0;
              index < isomorphicPackagesDevMode.length;
              index++
            ) {
              const packageName = isomorphicPackagesDevMode[index];
              const packageSource = this.project.nodeModules.pathFor([
                packageName,
                sourceLinkInNodeModules,
              ]);
              const packageSourceRealPath = crossPlatformPath(
                fse.realpathSync(packageSource),
              );

              const projFromSrouce = this.project.ins.From(
                path.dirname(path.dirname(packageSourceRealPath)),
              );

              if (projFromSrouce) {
                //#region link lib
                (() => {
                  const sourceLibInProjects = projFromSrouce.pathFor([
                    this.initOptions.build.websql
                      ? tmpSrcAppDistWebsql
                      : tmpSrcAppDist,
                    libFromNgProject,
                  ]);

                  const destinationLibInPorjects = crossPlatformPath([
                    this.project.location,
                    replacement(tmpProjectsStandalone),
                    projectsFromNgTemplate,
                    externalLibsFromNgProject,
                    srcNgProxyProject,
                    libFromNgProject,
                    projFromSrouce.nameForNpmPackage,
                    libFromSrc,
                  ]);

                  Helpers.createSymLink(
                    sourceLibInProjects,
                    destinationLibInPorjects,
                    {
                      continueWhenExistedFolderDoesntExists: true,
                    },
                  );
                })();
                //#endregion

                //#region link migration
                (() => {
                  const sourceMigrationInProjects = projFromSrouce.pathFor([
                    this.initOptions.build.websql
                      ? tmpSrcAppDistWebsql
                      : tmpSrcAppDist,
                    migrationsFromSrc,
                  ]);

                  const destinationMigrationInPorjects = crossPlatformPath([
                    this.project.location,
                    replacement(tmpProjectsStandalone),
                    projectsFromNgTemplate,
                    externalLibsFromNgProject,
                    srcNgProxyProject,
                    libFromNgProject,
                    projFromSrouce.nameForNpmPackage,
                    migrationsFromSrc,
                  ]);

                  Helpers.createSymLink(
                    sourceMigrationInProjects,
                    destinationMigrationInPorjects,
                    {
                      continueWhenExistedFolderDoesntExists: true,
                    },
                  );
                })();
                //#endregion

                Helpers.setValueToJSONC(
                  tsconfigPath,
                  `compilerOptions.paths['${projFromSrouce.nameForNpmPackage}/${
                    this.initOptions.build.websql
                      ? websqlMainProject
                      : browserMainProject
                  }']`,
                  [
                    crossPlatformPath([
                      projectsFromNgTemplate,
                      externalLibsFromNgProject,
                      srcNgProxyProject,
                      libFromNgProject,
                      projFromSrouce.nameForNpmPackage,
                      libFromSrc,
                    ]),
                  ],
                );
              }

              UtilsFilesFoldersSync.writeFile(
                [
                  this.project.location,
                  replacement(tmpProjectsStandalone),
                  projectsFromNgTemplate,
                  externalLibsFromNgProject,
                  srcNgProxyProject,
                  libFromNgProject,
                  `${externalLibsFromNgProject}.ts`,
                ],
                `// @ts-nocheck
${isomorphicPackagesDevMode.map(packageName => `export * from './${packageName}/${libFromSrc}';`).join('\n')}

              `,
              );
            }
          })();
          //#endregion

          //#endregion
        },
      },
      this.project,
    );
    return result;
    //#endregion
  }
}
