//#region imports
import * as JSON5 from 'json5';
import { config } from 'tnp-config/src';
import { crossPlatformPath, path } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';
import { Helpers } from 'tnp-helpers/src';

import { EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';

//#endregion

// @ts-ignore TODO weird inheritance problem
export class FilesTemplatesBuilder extends BaseFeatureForProject<Project> {
  //#region files
  get files() {
    //#region @backendFunc
    return this.project.artifactsManager.artifact.npmLibAndCliTool.filesRecreator.__filesTemplates();
    //#endregion
  }
  //#endregion

  //#region rebuild
  rebuild(initOptions: EnvOptions, soft = false) {
    //#region @backendFunc
    const files = this.files;
    // Helpers.info(`Files templates for project:

    // ${files.map(f => f).join('\n')}

    // `);
    for (let index = 0; index < files.length; index++) {
      const f = files[index];
      const filePath = crossPlatformPath([this.project.location, f]);
      if (Helpers.exists(filePath)) {
        var fileContent = Helpers.readFile(filePath);
      }
      if (!fileContent) {
        Helpers.warn(
          `[filesTemplats][rebuild] Not able to read file: ${filePath} - missing content`,
        );
        continue;
      }

      // Helpers.log(`Started for ${f}`);

      this.processFile(filePath, fileContent, initOptions, _, soft);
      // Helpers.log(`Processed DONE for ${f}`);
    }
    this.project.quickFixes.recreateTempSourceNecessaryFilesForTesting();
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
  private processFile(
    orgFilePath: string,
    content: string,
    reservedExpSec: EnvOptions,
    reservedExpOne: any,
    soft: boolean,
  ): void {
    //#region @backendFunc
    // lodash
    const filePath = orgFilePath.replace(
      `.${config.filesExtensions.filetemplate}`,
      '',
    );
    // if (filePath.endsWith('tsconfig.json')) {
    //   debugger;
    // }

    Helpers.log('processing file template', 1);
    // Helpers.pressKeyAndContinue();
    let newContent = content
      .split('\n')
      .filter(line => !line.trimLeft().startsWith('#'))
      .map(line => {
        const simpleLines = line.split('}}}').filter(f => !!f?.trim());
        simpleLines.forEach(l => {
          const matches = (l + '}}}').match(/\{\{\{.*\}\}\}/);
          if (_.isArray(matches)) {
            matches.forEach(pattern => {
              const expression = pattern.replace(/(\{|\})/g, '');
              // const reservedExpSec = ENV;
              // const reservedExpOne = _;
              // console.log('varssss: ', pattern)
              const exp = `(function(ENV,_){
                // console.log(typeof ENV)
                return ${expression.trim()}
              })(reservedExpSec,reservedExpOne)`;
              // console.log(exp)

              //     console.log(`Eval expre

              // ${exp}

              // `);

              try {
                var toReplace = eval(exp);
                line = line.replace(
                  new RegExp(Helpers.escapeStringForRegEx(pattern), 'g'),
                  toReplace,
                );
              } catch (err) {
                Helpers.info(`

                exp: ${exp}

                pattern: ${pattern}

                toReplace: ${toReplace}

                line: ${line}

                err: ${err}


                `);
                Helpers.error(
                  `Error during filtemplate parse: ${orgFilePath}`,
                  true,
                  true,
                );
                Helpers.error(err, soft, true);
              }
              // console.log('toReplace', toReplace)
            });
          }
        });

        return line;
      })
      .join('\n');

    Helpers.removeFileIfExists(filePath);
    if (filePath.endsWith('.json')) {
      try {
        const jsonparsed = JSON5.parse(newContent);
        newContent = JSON.stringify(jsonparsed, null, 2);
      } catch (e) {
        Helpers.log(e);
        Helpers.info(newContent);
        Helpers.error(
          `[filetemplate] Not able to parse new content` +
            ` for json in ${filePath}

          [probably env does not work]

          `,
          soft,
          true,
        );
      }
    }
    Helpers.writeFile(filePath, newContent);

    // if (!this.project.isCoreProject) {
    //   fse.unlinkSync(orgFilePath);
    // }
    //#endregion
  }
  //#endregion
}
