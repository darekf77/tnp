"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsideStructAngularLib = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const app_utils_1 = require("../../../../../app-utils");
const constants_1 = require("../../../../../constants");
const options_1 = require("../../../../../options");
const inside_struct_1 = require("../../__helpers__/inside-structures/inside-struct");
const base_inside_struct_1 = require("../../__helpers__/inside-structures/structs/base-inside-struct");
//#endregion
class InsideStructAngularLib extends base_inside_struct_1.BaseInsideStruct {
    getCurrentArtifact() {
        return options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL;
    }
    insideStruct() {
        //#region @backendFunc
        const project = this.project;
        let browserLibsTsCode = this.initOptions.build.websql
            ? constants_1.tmpLibsForDistWebsql
            : constants_1.tmpLibsForDist;
        if (this.initOptions.build.prod) {
            browserLibsTsCode = `${browserLibsTsCode}${constants_1.prodSuffix}`;
        }
        const tmpProjectsStandalone = (0, lib_2.crossPlatformPath)([
            browserLibsTsCode,
            project.name,
        ]);
        const result = inside_struct_1.InsideStruct.from({
            //#region pathes from container codere isomrophic lib
            relateivePathesFromContainer: this.relativePaths(),
            //#endregion
            projectType: project.type,
            frameworkVersion: project.framework.frameworkVersion,
            pathReplacements: [
                [
                    new RegExp(`^${lib_1.Utils.escapeStringForRegEx((0, app_utils_1.templateFolderForArtifact)(this.getCurrentArtifact()) + '/')}`),
                    () => {
                        return `${tmpProjectsStandalone}/`;
                    },
                ],
            ],
            linkNodeModulesTo: [
                `${(0, app_utils_1.templateFolderForArtifact)(this.getCurrentArtifact())}/`,
            ],
            endAction: ({ replacement }) => {
                //#region fixing package json dependencies in target proj
                (() => {
                    const jsonPath = lib_2.path.join(this.project.location, replacement(tmpProjectsStandalone), constants_1.packageJsonNgProject);
                    const container = this.project.framework.coreContainer;
                    const pj = new lib_4.BasePackageJson({ cwd: jsonPath });
                    pj.setDevDependencies({});
                    pj.setDependencies(container.packageJson.dependencies);
                })();
                //#endregion
                //#region replace my-lib from container in targe proj
                (() => {
                    const source = lib_2.path.join(this.project.location, replacement(tmpProjectsStandalone), `${constants_1.projectsFromNgTemplate}/${constants_1.myLibFromNgProject}`);
                    const dest = lib_2.path.join(this.project.location, replacement(tmpProjectsStandalone), `${constants_1.projectsFromNgTemplate}/${this.project.name}`);
                    lib_4.Helpers.remove(dest);
                    lib_4.HelpersTaon.move(source, dest);
                })();
                //#endregion
                (() => {
                    //#region hande / src / lib
                    let browserTsCode = this.initOptions.build.websql
                        ? constants_1.tmpSrcDistWebsql
                        : constants_1.tmpSrcDist;
                    if (this.initOptions.build.prod) {
                        browserTsCode = `${browserTsCode}${constants_1.prodSuffix}`;
                    }
                    const source = lib_2.path.join(this.project.location, browserTsCode, constants_1.libFromSrc);
                    const dest = lib_2.path.join(this.project.location, replacement(tmpProjectsStandalone), `${constants_1.projectsFromNgTemplate}/${this.project.name}/${constants_1.srcMainProject}/${constants_1.libFromSrc}`);
                    lib_4.Helpers.remove(dest);
                    lib_4.Helpers.createSymLink(source, dest, {
                        continueWhenExistedFolderDoesntExists: true,
                    });
                    //#endregion
                    //#region resolve varaibles
                    const sourcePublicApi = lib_2.path.join(this.project.location, replacement(tmpProjectsStandalone), `${constants_1.projectsFromNgTemplate}/${this.project.name}/${constants_1.srcMainProject}/${lib_3.fileName.public_api_ts}`);
                    let publicApiFile = lib_4.Helpers.readFile(sourcePublicApi);
                    const sourceTsconfig = lib_2.path.join(this.project.location, replacement(tmpProjectsStandalone), constants_1.tsconfigSpecNgProject);
                    let tsconfigJson = lib_4.Helpers.readJson(sourceTsconfig, void 0, true);
                    // console.log({
                    //   sourceTsconfig
                    // })
                    if (tsconfigJson) {
                        tsconfigJson.compilerOptions ? tsconfigJson.compilerOptions : {};
                    }
                    //#endregion
                    if (tsconfigJson) {
                        tsconfigJson.compilerOptions.paths = void 0;
                    }
                    publicApiFile = `
export * from './${constants_1.libFromSrc}';
`.trimLeft();
                    if (tsconfigJson) {
                        lib_4.Helpers.writeJson(sourceTsconfig, tsconfigJson);
                    }
                    lib_4.Helpers.writeFile(sourcePublicApi, publicApiFile);
                })();
                const libPackageJson = (0, lib_2.crossPlatformPath)([
                    this.project.location,
                    replacement(tmpProjectsStandalone),
                    `${constants_1.projectsFromNgTemplate}/${this.project.name}/${constants_1.CoreNgTemplateFiles.PACKAGE_JSON}`,
                ]);
                const ngPackageJson = (0, lib_2.crossPlatformPath)([
                    this.project.location,
                    replacement(tmpProjectsStandalone),
                    `${constants_1.projectsFromNgTemplate}/${this.project.name}/${constants_1.CoreNgTemplateFiles.NG_PACKAGE_JSON}`,
                ]);
                const angularJson = (0, lib_2.crossPlatformPath)([
                    this.project.location,
                    replacement(tmpProjectsStandalone),
                    constants_1.CoreNgTemplateFiles.ANGULAR_JSON,
                ]);
                const tsconfigJson = (0, lib_2.crossPlatformPath)([
                    this.project.location,
                    replacement(tmpProjectsStandalone),
                    constants_1.tsconfigNgProject,
                ]);
                [libPackageJson].forEach(f => {
                    let content = lib_4.Helpers.readFile(f) || '';
                    content = content.replace(new RegExp(lib_1.Utils.escapeStringForRegEx(constants_1.myLibFromNgProject), 'g'), `${this.project.name}` +
                        `/${this.initOptions.build.websql ? constants_1.websqlMainProject : constants_1.browserMainProject}` +
                        `${this.initOptions.build.prod ? `${constants_1.prodSuffix}` : ''}`);
                    lib_4.Helpers.writeFile(f, content);
                });
                [ngPackageJson, angularJson, tsconfigJson].forEach(f => {
                    let content = lib_4.Helpers.readFile(f) || '';
                    content = content.replace(new RegExp(lib_1.Utils.escapeStringForRegEx(constants_1.myLibFromNgProject), 'g'), this.project.name);
                    // TODO not needed?
                    // if (path.basename(f) === tsconfigNgProject) {
                    //   console.log(`CHANING ${f}`);
                    //   // debugger;
                    //   content = content.replace(
                    //     new RegExp(
                    //       Utils.escapeStringForRegEx(
                    //         `"${distFromNgBuild}/${this.project.name}`,
                    //       ),
                    //       'g',
                    //     ),
                    //     `"../../${distMainProject}/` +
                    //       `${this.initOptions.build.websql ? websqlMainProject : browserMainProject}` +
                    //       // proper compilation browser-prod / websql-prod
                    //       `${this.initOptions.build.prod ? `${prodSuffix}` : ''}` +
                    //       `/${this.project.name}`,
                    //   );
                    // }
                    lib_4.Helpers.writeFile(f, content);
                });
                (() => {
                    const json = lib_4.Helpers.readJson(ngPackageJson); // dist is on purpose
                    json.dest = json.dest.replace(`/${constants_1.distFromNgBuild}/${this.project.name}`, `/../../${constants_1.distMainProject +
                        (this.initOptions.build.prod ? `${constants_1.prodSuffix}` : '')}/` +
                        `${this.initOptions.build.websql ? constants_1.websqlMainProject : constants_1.browserMainProject}`);
                    lib_4.Helpers.writeJson(ngPackageJson, json);
                })();
            },
        }, project);
        return result;
        //#endregion
    }
}
exports.InsideStructAngularLib = InsideStructAngularLib;
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/inside-struct-angular-lib.js.map