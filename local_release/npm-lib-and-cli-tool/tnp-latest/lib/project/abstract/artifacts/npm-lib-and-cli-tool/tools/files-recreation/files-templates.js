"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesTemplatesBuilder = void 0;
//#region imports
const JSON5 = require("json5");
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const lib_5 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../constants");
//#endregion
// @ts-ignore TODO weird inheritance problem
class FilesTemplatesBuilder extends lib_4.BaseFeatureForProject {
    //#region files
    get files() {
        //#region @backendFunc
        return this.project.artifactsManager.filesRecreator.filesTemplates();
        //#endregion
    }
    //#endregion
    //#region rebuild
    rebuild(initOptions, soft = false) {
        //#region @backendFunc
        const files = this.files;
        // Helpers.info(`Files templates for project:
        // ${files.map(f => f).join('\n')}
        // `);
        for (let index = 0; index < files.length; index++) {
            const f = files[index];
            const filePath = (0, lib_2.crossPlatformPath)([this.project.location, f]);
            if (lib_5.Helpers.exists(filePath)) {
                var fileContent = lib_5.Helpers.readFile(filePath);
            }
            if (!fileContent) {
                lib_5.Helpers.warn(`[filesTemplats][rebuild] Not able to read file: ${filePath} - missing content`);
                continue;
            }
            // Helpers.log(`Started for ${f}`);
            this.processFile(filePath, fileContent, initOptions, soft);
            lib_5.Helpers.logInfo(`Processed DONE for ${f}`);
        }
        this.project.quickFixes.recreateTempSourceNecessaryFilesForTesting(initOptions);
        //#endregion
    }
    //#endregion
    //#region rebuildFile
    // rebuildFile(filetemplateRelativePath, soft = false) {
    // const filePath = path.join(this.project.location, filetemplateRelativePath);
    // try {
    //   var fileContent = Helpers.readFile(filePath);
    //   if (!fileContent) {
    //     Helpers.warn(
    //       `[filesTemplats][rebuildFile] Not able to read file: ${filePath} - no content of file`,
    //     );
    //     return;
    //   }
    // } catch (error) {
    //   Helpers.warn(
    //     `[filesTemplats][rebuildFile] Not able to read file: ${filePath} - problem with reading file`,
    //   );
    //   return;
    // }
    // const env = this.project.env || EnvOptions.from({});
    // this.processFile(filePath, fileContent, env, _, soft);
    // }
    //#endregion
    //#region processFile
    processFile(orgFilePath, content, reservedExpSec, soft) {
        //#region @backendFunc
        // lodash
        const filePath = orgFilePath.replace(constants_1.dotFileTemplateExt, '');
        // if (filePath.endsWith('tsconfig.json')) {
        //   debugger;
        // }
        lib_5.Helpers.log('processing file template', 1);
        // Helpers.pressKeyAndContinue();
        let newContent = content
            .split('\n')
            .filter(line => !line.trimLeft().startsWith('#'))
            .map(line => {
            const simpleLines = line.split('}}}').filter(f => !!f?.trim());
            simpleLines.forEach(l => {
                const matches = (l + '}}}').match(/\{\{\{.*\}\}\}/);
                if (lib_3._.isArray(matches)) {
                    matches.forEach(pattern => {
                        const expression = pattern.replace(/(\{|\})/g, '');
                        // const reservedExpSec = ENV;
                        // console.log('varssss: ', pattern)
                        const exp = `(function(ENV,_){
                // console.log(typeof ENV)
                return ${expression.trim()}
              })(reservedExpSec)`;
                        // console.log(exp)
                        //     console.log(`Eval expre
                        // ${exp}
                        // `);
                        try {
                            var toReplace = eval(exp);
                            line = line.replace(new RegExp(lib_1.Utils.escapeStringForRegEx(pattern), 'g'), toReplace);
                        }
                        catch (err) {
                            lib_5.Helpers.info(`

                exp: ${exp}

                pattern: ${pattern}

                toReplace: ${toReplace}

                line: ${line}

                err: ${err}

                `);
                            lib_5.Helpers.error(`Error during filtemplate parse: ${orgFilePath}`, true, true);
                            lib_5.Helpers.error(err, soft, true);
                        }
                        // console.log('toReplace', toReplace)
                    });
                }
            });
            return line;
        })
            .join('\n');
        lib_5.Helpers.removeFileIfExists(filePath);
        if (filePath.endsWith('.json')) {
            try {
                const jsonparsed = JSON5.parse(newContent);
                newContent = JSON.stringify(jsonparsed, null, 2);
            }
            catch (e) {
                lib_5.Helpers.log(e);
                lib_5.Helpers.info(newContent);
                lib_5.Helpers.error(`[filetemplate] Not able to parse new content` +
                    ` for json in ${filePath}

          [probably env does not work]

          `, soft, true);
            }
        }
        lib_5.Helpers.writeFile(filePath, newContent);
        // if (!this.project.isCoreProject) {
        //   fse.unlinkSync(orgFilePath);
        // }
        //#endregion
    }
}
exports.FilesTemplatesBuilder = FilesTemplatesBuilder;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/files-recreation/files-templates.js.map