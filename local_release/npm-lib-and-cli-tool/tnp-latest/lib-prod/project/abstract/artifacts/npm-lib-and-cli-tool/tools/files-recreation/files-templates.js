//#region imports
import * as JSON5 from 'json5';
import { Utils__NS__escapeStringForRegEx } from 'tnp-core/lib-prod';
import { crossPlatformPath } from 'tnp-core/lib-prod';
import { ___NS__isArray } from 'tnp-core/lib-prod';
import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { Helpers__NS__error, Helpers__NS__exists, Helpers__NS__info, Helpers__NS__log, Helpers__NS__logInfo, Helpers__NS__readFile, Helpers__NS__removeFileIfExists, Helpers__NS__warn, Helpers__NS__writeFile } from 'tnp-helpers/lib-prod';
import { dotFileTemplateExt } from '../../../../../../constants';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class FilesTemplatesBuilder extends BaseFeatureForProject {
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
        // Helpers__NS__info(`Files templates for project:
        // ${files.map(f => f).join('\n')}
        // `);
        for (let index = 0; index < files.length; index++) {
            const f = files[index];
            const filePath = crossPlatformPath([this.project.location, f]);
            if (Helpers__NS__exists(filePath)) {
                var fileContent = Helpers__NS__readFile(filePath);
            }
            if (!fileContent) {
                Helpers__NS__warn(`[filesTemplats][rebuild] Not able to read file: ${filePath} - missing content`);
                continue;
            }
            // Helpers__NS__log(`Started for ${f}`);
            this.processFile(filePath, fileContent, initOptions, soft);
            Helpers__NS__logInfo(`Processed DONE for ${f}`);
        }
        this.project.quickFixes.recreateTempSourceNecessaryFilesForTesting(initOptions);
        //#endregion
    }
    //#endregion
    //#region rebuildFile
    // rebuildFile(filetemplateRelativePath, soft = false) {
    // const filePath = path.join(this.project.location, filetemplateRelativePath);
    // try {
    //   var fileContent = Helpers__NS__readFile(filePath);
    //   if (!fileContent) {
    //     Helpers__NS__warn(
    //       `[filesTemplats][rebuildFile] Not able to read file: ${filePath} - no content of file`,
    //     );
    //     return;
    //   }
    // } catch (error) {
    //   Helpers__NS__warn(
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
        const filePath = orgFilePath.replace(dotFileTemplateExt, '');
        // if (filePath.endsWith('tsconfig.json')) {
        //   debugger;
        // }
        Helpers__NS__log('processing file template', 1);
        // Helpers.pressKeyAndContinue();
        let newContent = content
            .split('\n')
            .filter(line => !line.trimLeft().startsWith('#'))
            .map(line => {
            const simpleLines = line.split('}}}').filter(f => !!f?.trim());
            simpleLines.forEach(l => {
                const matches = (l + '}}}').match(/\{\{\{.*\}\}\}/);
                if (___NS__isArray(matches)) {
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
                            line = line.replace(new RegExp(Utils__NS__escapeStringForRegEx(pattern), 'g'), toReplace);
                        }
                        catch (err) {
                            Helpers__NS__info(`

                exp: ${exp}

                pattern: ${pattern}

                toReplace: ${toReplace}

                line: ${line}

                err: ${err}

                `);
                            Helpers__NS__error(`Error during filtemplate parse: ${orgFilePath}`, true, true);
                            Helpers__NS__error(err, soft, true);
                        }
                        // console.log('toReplace', toReplace)
                    });
                }
            });
            return line;
        })
            .join('\n');
        Helpers__NS__removeFileIfExists(filePath);
        if (filePath.endsWith('.json')) {
            try {
                const jsonparsed = JSON5.parse(newContent);
                newContent = JSON.stringify(jsonparsed, null, 2);
            }
            catch (e) {
                Helpers__NS__log(e);
                Helpers__NS__info(newContent);
                Helpers__NS__error(`[filetemplate] Not able to parse new content` +
                    ` for json in ${filePath}

          [probably env does not work]

          `, soft, true);
            }
        }
        Helpers__NS__writeFile(filePath, newContent);
        // if (!this.project.isCoreProject) {
        //   fse.unlinkSync(orgFilePath);
        // }
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/files-recreation/files-templates.js.map