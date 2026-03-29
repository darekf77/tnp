"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsideStructAngularApp = void 0;
//#region imports
const lib_1 = require("isomorphic-region-loader/lib");
const lib_2 = require("magic-renamer/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-helpers/lib");
const app_utils_1 = require("../../../../../app-utils");
const constants_1 = require("../../../../../constants");
const options_1 = require("../../../../../options");
const inside_struct_1 = require("../../__helpers__/inside-structures/inside-struct");
const base_inside_struct_1 = require("../../__helpers__/inside-structures/structs/base-inside-struct");
const inside_struct_helpers_1 = require("../../__helpers__/inside-structures/structs/inside-struct-helpers");
const image_loader_1 = require("../../__helpers__/inside-structures/structs/loaders/image-loader");
const loaders_1 = require("../../__helpers__/inside-structures/structs/loaders/loaders");
//#endregion
class InsideStructAngularApp extends base_inside_struct_1.BaseInsideStruct {
    getCurrentArtifact() {
        return options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP;
    }
    get isElectron() {
        return this.getCurrentArtifact() === options_1.ReleaseArtifactTaon.ELECTRON_APP;
    }
    resolveTmpProjectStandalonePath() {
        const prodSuffixStr = this.initOptions.build.prod ? constants_1.prodSuffix : '';
        if (this.initOptions.build.websql) {
            if (this.isElectron) {
                return (constants_1.tmpAppsForDistElectronWebsql + prodSuffixStr + `/${this.project.name}`);
            }
            else {
                return constants_1.tmpAppsForDistWebsql + prodSuffixStr + `/${this.project.name}`;
            }
        }
        else {
            if (this.isElectron) {
                return constants_1.tmpAppsForDistElectron + prodSuffixStr + `/${this.project.name}`;
            }
            else {
                return constants_1.tmpAppsForDist + prodSuffixStr + `/${this.project.name}`;
            }
        }
    }
    insideStruct() {
        //#region @backendFunc
        const tmpProjectsStandalone = this.resolveTmpProjectStandalonePath();
        const templateFolderInCoreProject = (0, app_utils_1.templateFolderForArtifact)(this.isElectron
            ? options_1.ReleaseArtifactTaon.ELECTRON_APP
            : options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP);
        const result = inside_struct_1.InsideStruct.from({
            relateivePathesFromContainer: this.relativePaths(),
            projectType: this.project.type,
            frameworkVersion: this.project.framework.frameworkVersion,
            pathReplacements: [
                [
                    new RegExp(`^${lib_3.Utils.escapeStringForRegEx(templateFolderInCoreProject + '/')}`),
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
                        let browserTsAppCode = this.initOptions.build.websql
                            ? constants_1.tmpSrcAppDistWebsql
                            : constants_1.tmpSrcAppDist;
                        if (this.initOptions.build.prod) {
                            browserTsAppCode = `${browserTsAppCode}${constants_1.prodSuffix}`;
                        }
                        return browserTsAppCode;
                    },
                    // to this
                    () => {
                        const standalonePath = (0, lib_4.crossPlatformPath)([
                            templateFolderInCoreProject,
                            constants_1.srcNgProxyProject,
                            constants_1.appFromSrcInsideNgApp,
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
                    const magicRenameRules = `ProjectName->${lib_4._.upperFirst(lib_4._.camelCase(this.project.name))}`;
                    // const filesToProcess = UtilsFilesFoldersSync.getFilesFrom([
                    //   project.location,
                    //   replacement(tmpProjectsStandalone),
                    //   srcNgProxyProject,
                    // ]).filter(f => {
                    //   return f.endsWith('.ts');
                    // });
                    const base = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.srcNgProxyProject,
                    ]);
                    const filesToProcess = ['main.ts', 'main.server.ts'].map(rel => (0, lib_4.crossPlatformPath)([base, rel]));
                    for (const destinationAbsPath of filesToProcess) {
                        // console.log({
                        //   magicRenameRules,
                        //   destinationAbsPath,
                        // });
                        let content = lib_5.Helpers.readFile(destinationAbsPath);
                        const [fromReplace, toReplace] = magicRenameRules.split('->');
                        content = content.replace(new RegExp(lib_3.Utils.escapeStringForRegEx(fromReplace), 'g'), toReplace);
                        if (!this.initOptions.build.websql) {
                            const regionsToRemove = [lib_3.TAGS.WEBSQL_ONLY];
                            content = lib_1.RegionRemover.from(destinationAbsPath, content, regionsToRemove, this.project).output;
                        }
                        content = content.replace('<<<TO_REPLACE_CURRENT_PROJECT_GENERIC_NAME>>>', btoa(lib_4.path.dirname(this.project.location)) +
                            '___' +
                            this.project.nameForNpmPackage);
                        // const rules = RenameRule.from(magicRenameRules);
                        // for (const rule of rules) {
                        //   content = rule.replaceInString(content);
                        // }
                        lib_5.Helpers.writeFile(destinationAbsPath, content);
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
                //                   Utils.escapeStringForRegEx('//distReleaseOnly'),
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
                    const sqlJsLoadFileAbsPath = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.srcNgProxyProject,
                        constants_1.CoreNgTemplateFiles.sqlJSLoaderTs,
                    ]);
                    this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.replaceBaseHrefInFile(sqlJsLoadFileAbsPath, this.initOptions);
                    let sqlJSFileContent = lib_5.Helpers.readFile(sqlJsLoadFileAbsPath);
                    sqlJSFileContent = this.replaceImportsForBrowserOrWebsql(sqlJSFileContent, {
                        websql: this.initOptions.build.websql,
                    });
                    lib_5.Helpers.writeFile(sqlJsLoadFileAbsPath, sqlJSFileContent);
                    // });
                })();
                //#endregion
                //#region TODO - LOADERS & BACKGROUNDS REPLACEMENT
                (() => {
                    const frontendBaseHref = this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(this.initOptions);
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
                        const appModuleFilePath = lib_4.path.join(this.project.location, replacement(tmpProjectsStandalone), `/${constants_1.srcNgProxyProject}/${constants_1.CoreNgTemplateFiles.INDEX_HTML_NG_APP}`);
                        let indexHtmlFile = lib_5.Helpers.readFile(appModuleFilePath);
                        const loaderData = this.initOptions.loading.preAngularBootstrap.loader;
                        const loaderIsImage = lib_4._.isString(loaderData);
                        if (loaderIsImage) {
                            const pathToAsset = frontendBaseHref +
                                (0, inside_struct_helpers_1.resolvePathToAsset)(this.project, loaderData);
                            indexHtmlFile = indexHtmlFile.replace('<!-- <<<TO_REPLACE_LOADER>>> -->', (0, image_loader_1.imageLoader)(pathToAsset, true));
                        }
                        else {
                            if (loaderData?.name) {
                                const loaderToReplace = (0, loaders_1.getLoader)(loaderData?.name, loaderData?.color);
                                indexHtmlFile = indexHtmlFile.replace('<!-- <<<TO_REPLACE_LOADER>>> -->', loaderToReplace);
                            }
                        }
                        const bgColor = this.initOptions.loading.preAngularBootstrap.background;
                        const bgColorStyle = bgColor
                            ? `style="background-color: ${bgColor};"`
                            : '';
                        indexHtmlFile = indexHtmlFile.replace('TAON_TO_REPLACE_COLOR', bgColorStyle || '');
                        lib_5.Helpers.writeFile(appModuleFilePath, indexHtmlFile);
                    })();
                    //#endregion
                })();
                //#endregion
                //#region DONE -  replace app.component.html
                (() => {
                    const indexHtmlFilePath = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.srcNgProxyProject,
                        constants_1.CoreNgTemplateFiles.INDEX_HTML_NG_APP,
                    ]);
                    let indexHtmlFile = lib_5.Helpers.readFile(indexHtmlFilePath);
                    const title = this.initOptions.website.title;
                    const titleToReplace = title
                        ? title
                        : lib_4._.startCase(this.project.name);
                    // console.log({
                    //   titleToReplace
                    // })
                    indexHtmlFile = indexHtmlFile.replace('<title>App</title>', `<title>${titleToReplace}</title>`);
                    lib_5.Helpers.writeFile(indexHtmlFilePath, indexHtmlFile);
                })();
                //#endregion
                //#region DONE - replace style.scss
                (() => {
                    const stylesFilePath = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.srcNgProxyProject,
                        constants_1.ngProjectStylesScss,
                    ]);
                    this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.replaceBaseHrefInFile(stylesFilePath, this.initOptions);
                })();
                //#endregion
                //#region TODO (what I am doing here) .. replace favicon.ico
                (() => {
                    const source = this.project.pathFor(`${constants_1.srcMainProject}/${constants_1.assetsFromSrc}/${constants_1.generatedFromAssets}` +
                        `/${constants_1.pwaGeneratedFolder}/${constants_1.CoreNgTemplateFiles.FAVICON_ICO}`);
                    const faviconPathDest = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.srcNgProxyProject,
                        constants_1.CoreNgTemplateFiles.FAVICON_ICO,
                    ]);
                    if (lib_5.Helpers.exists(source)) {
                        lib_5.HelpersTaon.copyFile(source, faviconPathDest);
                    }
                })();
                //#endregion
                //#region link assets DONE
                (() => {
                    let browserTsCode = this.initOptions.build.websql
                        ? constants_1.tmpSrcDistWebsql
                        : constants_1.tmpSrcDist;
                    if (this.initOptions.build.prod) {
                        browserTsCode = `${browserTsCode}${constants_1.prodSuffix}`;
                    }
                    const assetsSource = this.project.pathFor([
                        replacement(browserTsCode),
                        constants_1.assetsFromSrc,
                    ]);
                    if (!lib_5.Helpers.exists(assetsSource)) {
                        lib_5.Helpers.mkdirp(assetsSource);
                    }
                    const assetsDest = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.srcNgProxyProject,
                        constants_1.assetsFromNgProj,
                    ]);
                    lib_5.Helpers.remove(assetsDest);
                    lib_5.Helpers.createSymLink(assetsSource, assetsDest);
                })();
                //#endregion
                if (this.isElectron) {
                    //#region electron DONE
                    (() => {
                        const electronBackend = this.project.pathFor(replacement(constants_1.distMainProject));
                        if (!lib_5.Helpers.exists(electronBackend)) {
                            lib_5.Helpers.mkdirp(electronBackend);
                        }
                        const compileTs = (0, lib_4.crossPlatformPath)([
                            this.project.location,
                            replacement(tmpProjectsStandalone),
                            constants_1.electronNgProj,
                            constants_1.TaonGeneratedFolders.COMPILED,
                        ]);
                        try {
                            lib_4.fse.unlinkSync(compileTs);
                        }
                        catch (error) {
                            lib_5.Helpers.remove(compileTs);
                        }
                        lib_5.Helpers.createSymLink(electronBackend, compileTs);
                        const packageJson = new lib_5.BasePackageJson({
                            cwd: (0, lib_4.crossPlatformPath)(lib_4.path.join(this.project.location, replacement(tmpProjectsStandalone), `/${constants_1.packageJsonNgProject}`)),
                        });
                        packageJson.setName(this.project.name);
                        if (this.initOptions.release.releaseType) {
                            packageJson.setMainProperty(`${constants_1.electronNgProj}/${constants_1.indexJSElectronDist}`);
                        }
                        packageJson.setVersion(this.project.packageJson.version);
                    })();
                    //#endregion
                }
                const disablePwa = this.isElectron ||
                    !this.initOptions.build.pwa ||
                    this.initOptions.build.pwa.disableServiceWorker;
                if (disablePwa) {
                    (() => {
                        const appModuleFilePath = (0, lib_4.crossPlatformPath)([
                            this.project.location,
                            replacement(tmpProjectsStandalone),
                            constants_1.srcNgProxyProject,
                            constants_1.CoreNgTemplateFiles.INDEX_HTML_NG_APP,
                        ]);
                        let indexHtmlFile = lib_5.Helpers.readFile(appModuleFilePath);
                        indexHtmlFile = indexHtmlFile.replace('<link rel="manifest" href="manifest.webmanifest">', '');
                        lib_5.Helpers.writeFile(appModuleFilePath, indexHtmlFile);
                    })();
                    //#region disable pwa in angular json
                    (() => {
                        const angularJsonPath = (0, lib_4.crossPlatformPath)([
                            this.project.location,
                            replacement(tmpProjectsStandalone),
                            constants_1.CoreNgTemplateFiles.ANGULAR_JSON,
                        ]);
                        // projects.app.architect.build.configurations["production-static"].serviceWorker
                        // projects.app.architect.build.configurations.production.serviceWorker
                        lib_5.HelpersTaon.setValueToJSON(angularJsonPath, `projects.${this.isElectron
                            ? constants_1.AngularJsonTaskName.ELECTRON_APP
                            : constants_1.AngularJsonTaskName.ANGULAR_APP}.architect.build.configurations[${constants_1.AngularJsonAppOrElectronTaskName.productionSsr}].serviceWorker`, void 0);
                        lib_5.HelpersTaon.setValueToJSON(angularJsonPath, `projects.${this.isElectron
                            ? constants_1.AngularJsonTaskName.ELECTRON_APP
                            : constants_1.AngularJsonTaskName.ANGULAR_APP}.architect.build.configurations[${constants_1.AngularJsonAppOrElectronTaskName.productionStatic}].serviceWorker`, void 0);
                    })();
                    //#endregion
                }
                //#region DONE rebuild manifest + index.html
                await (async () => {
                    const manifestJsonPath = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.srcNgProxyProject,
                        constants_1.CoreNgTemplateFiles.WEBMANIFEST_JSON,
                    ]);
                    if (disablePwa) {
                        lib_5.Helpers.removeFileIfExists(manifestJsonPath);
                        return;
                    }
                    const indexHtmlPath = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.srcNgProxyProject,
                        constants_1.CoreNgTemplateFiles.INDEX_HTML_NG_APP,
                    ]);
                    const manifestJson = lib_5.Helpers.readJson(manifestJsonPath, {}, true);
                    let indexHtml = lib_5.Helpers.readFile(indexHtmlPath);
                    manifestJson.name =
                        this.initOptions.build.pwa.name || lib_4._.startCase(this.project.name);
                    manifestJson.short_name =
                        this.initOptions.build.pwa.short_name || this.project.name;
                    const assetsPath = this.project.pathFor([
                        constants_1.srcMainProject,
                        constants_1.assetsFromSrc,
                    ]);
                    if (this.project.artifactsManager.globalHelper.branding.exist) {
                        // apply pwa generated icons
                        manifestJson.icons =
                            this.project.artifactsManager.globalHelper.branding.iconsToAdd;
                        indexHtml = indexHtml.replace(`<link rel="icon" type="image/x-icon" href="favicon.ico">`, '');
                        indexHtml = indexHtml.replace(this.project.artifactsManager.globalHelper.branding
                            .htmlIndexRepaceTag, this.project.artifactsManager.globalHelper.branding.htmlLinesToAdd.join('\n'));
                        indexHtml = indexHtml.replace(`<link rel="icon" type="image/x-icon" href="/`, `<link rel="icon" type="image/x-icon" href="`);
                    }
                    else {
                        // apply default icons
                        const iconsPath = (0, lib_4.crossPlatformPath)(lib_4.path.join(assetsPath, 'icons'));
                        const iconsFilesPathes = lib_5.Helpers.filesFrom(iconsPath).filter(f => {
                            return lib_4.CoreModels.ImageFileExtensionArr.includes(lib_4.path.extname(f).replace('.', ''));
                        }); // glob.sync(`${iconsPath}/**/*.(png|jpeg|svg)`);
                        manifestJson.icons = iconsFilesPathes.map(f => {
                            return {
                                src: f.replace(`${lib_4.path.dirname(assetsPath)}/`, ''),
                                sizes: lib_4._.last(lib_4.path.basename(f).replace(lib_4.path.extname(f), '').split('-')),
                                type: `image/${lib_4.path.extname(f).replace('.', '')}`,
                                purpose: 'maskable any',
                            };
                        });
                    }
                    manifestJson.icons = manifestJson.icons.map(c => {
                        c.src = c.src.replace(/^\//, '');
                        return c;
                    });
                    if (this.initOptions.build.watch) {
                        const project = this.project;
                        if (this.initOptions.build.websql) {
                            const websqlAppUrl = `http://localhost:${project.readFile(constants_1.tmp_FRONTEND_WEBSQL_APP_PORT + '_1')}`;
                            manifestJson.start_url = websqlAppUrl;
                        }
                        else {
                            const normalAppUrl = `http://localhost:${project.readFile(constants_1.tmp_FRONTEND_NORMAL_APP_PORT + '_1')}`;
                            manifestJson.start_url = normalAppUrl;
                        }
                    }
                    else {
                        if (this.initOptions.build.pwa.start_url) {
                            manifestJson.start_url = this.initOptions.build.pwa.start_url;
                        }
                        else if (this.initOptions.website.useDomain) {
                            manifestJson.start_url = `https://${this.initOptions.website.domain}/`;
                        }
                        else {
                            manifestJson.start_url = `/${this.project.name}/`; // perfect for github.io OR when subdomain myproject.com/docs/
                        }
                    }
                    lib_5.Helpers.writeJson(manifestJsonPath, manifestJson);
                    lib_5.Helpers.writeFile(indexHtmlPath, indexHtml);
                })();
                //#endregion
                //#region DONE replace base href
                (() => {
                    const angularJsonPath = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.CoreNgTemplateFiles.ANGULAR_JSON,
                    ]);
                    lib_5.HelpersTaon.setValueToJSON(angularJsonPath, // TODO @LAST is here angular electron task needed ?
                    `projects.${
                    // this.isElectron
                    // ? AngularJsonTaskName.ELECTRON_APP // TODO probably not need for now
                    // :
                    constants_1.AngularJsonTaskName.ANGULAR_APP}.architect.build.options.baseHref`, this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(this.initOptions));
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
                    const isomorphicPackagesDevMode = this.project.nodeModules.getIsomorphicPackagesNamesInDevMode();
                    // console.log(isomorphicPackagesDevMode);
                    const tsconfigPath = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.tsconfigNgProject,
                    ]);
                    const existedMyLib = (0, lib_4.crossPlatformPath)([
                        this.project.location,
                        replacement(tmpProjectsStandalone),
                        constants_1.projectsFromNgTemplate,
                        constants_1.myLibFromNgProject,
                    ]);
                    const ins = lib_2.MagicRenamer.Instance(existedMyLib, true);
                    const rule = `${constants_1.myLibFromNgProject} => ${constants_1.externalLibsFromNgProject}`;
                    ins.start(rule, []);
                    // 2. link src to in-dev-packages-lib
                    for (let index = 0; index < isomorphicPackagesDevMode.length; index++) {
                        const packageName = isomorphicPackagesDevMode[index];
                        const packageSource = this.project.nodeModules.pathFor([
                            packageName,
                            constants_1.sourceLinkInNodeModules,
                        ]);
                        const packageSourceRealPath = (0, lib_4.crossPlatformPath)(lib_4.fse.realpathSync(packageSource));
                        const projFromSrouce = this.project.ins.From(lib_4.path.dirname(lib_4.path.dirname(packageSourceRealPath)));
                        if (projFromSrouce) {
                            //#region link lib
                            (() => {
                                const sourceLibInProjects = projFromSrouce.pathFor([
                                    (this.initOptions.build.websql
                                        ? constants_1.tmpSrcAppDistWebsql
                                        : constants_1.tmpSrcAppDist) +
                                        (this.initOptions.build.prod ? constants_1.prodSuffix : ''),
                                    constants_1.libFromNgProject,
                                ]);
                                const destinationLibInPorjects = (0, lib_4.crossPlatformPath)([
                                    this.project.location,
                                    replacement(tmpProjectsStandalone),
                                    constants_1.projectsFromNgTemplate,
                                    constants_1.externalLibsFromNgProject,
                                    constants_1.srcNgProxyProject,
                                    constants_1.libFromNgProject,
                                    projFromSrouce.nameForNpmPackage,
                                    constants_1.libFromSrc,
                                ]);
                                lib_5.Helpers.createSymLink(sourceLibInProjects, destinationLibInPorjects, {
                                    continueWhenExistedFolderDoesntExists: true,
                                });
                            })();
                            //#endregion
                            lib_5.HelpersTaon.setValueToJSONC(tsconfigPath, `compilerOptions.paths['${projFromSrouce.nameForNpmPackage}/${this.initOptions.build.websql
                                ? constants_1.websqlMainProject
                                : constants_1.browserMainProject}']`, [
                                (0, lib_4.crossPlatformPath)([
                                    constants_1.projectsFromNgTemplate,
                                    constants_1.externalLibsFromNgProject,
                                    constants_1.srcNgProxyProject,
                                    constants_1.libFromNgProject,
                                    projFromSrouce.nameForNpmPackage,
                                    constants_1.libFromSrc,
                                ]),
                            ]);
                        }
                        lib_3.UtilsFilesFoldersSync.writeFile([
                            this.project.location,
                            replacement(tmpProjectsStandalone),
                            constants_1.projectsFromNgTemplate,
                            constants_1.externalLibsFromNgProject,
                            constants_1.srcNgProxyProject,
                            constants_1.libFromNgProject,
                            `${constants_1.externalLibsFromNgProject}.ts`,
                        ], `// @ts-nocheck
${isomorphicPackagesDevMode.map(packageName => `export * from './${packageName}/${constants_1.libFromSrc}';`).join('\n')}

              `);
                    }
                })();
                //#endregion
                //#endregion
            },
        }, this.project);
        return result;
        //#endregion
    }
}
exports.InsideStructAngularApp = InsideStructAngularApp;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/angular-node-app/tools/inside-struct-angular-app.js.map