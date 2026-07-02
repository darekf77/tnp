//#region imports
import { UtilsI18nHtml, UtilsPoFile } from '@taon-dev/i18n/src';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  chokidar,
  CoreModels,
  _,
  UtilsFilesFoldersSync,
  fse,
  Utils,
  UtilsI18n,
} from 'tnp-core/src';
import { crossPlatformPath, path } from 'tnp-core/src';
import {
  BaseFeatureForProject,
  Helpers,
  UtilsTypescript,
} from 'tnp-helpers/src';

import {
  assetsFromTempSrc,
  i18nDataTsFileExt,
  i18nFolder,
  packageJsonNpmLib,
  srcMainProject,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpSourceDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
} from '../../constants';

import { Project } from './project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class TranslationI18n extends BaseFeatureForProject<Project> {
  async start() {
    //#region @backendFunc
    const base = this.project.location;

    //#region find files
    const files = UtilsFilesFoldersSync.getFilesFrom(base, {
      followSymlinks: false,
      recursive: true,
    })
      .map(f => {
        const fileRelativePath = f.replace(base + '/', '');
        if (
          fileRelativePath.startsWith('src/lib/env/') ||
          fileRelativePath.startsWith('src/assets/')
        ) {
          return;
        }

        const content = UtilsFilesFoldersSync.readFile(f);
        if (!content && content.includes('gettext')) {
          return;
        }

        let tags: UtilsI18n.GettextExtracted[] = [];
        if (['.ts', '.tsx'].includes(path.extname(f))) {
          tags = UtilsTypescript.extractGettextFromTs(content);
        }

        if (['.html'].includes(path.extname(f))) {
          tags = UtilsI18nHtml.extractGettextTranslateFromHtml(content);
        }

        if (tags.length === 0) {
          return;
        }

        return {
          isAppFile: !fileRelativePath.startsWith('src/lib/'),
          fileAbsPath: f,
          fileRelativePath,
          tags,
        } as UtilsI18n.GettextFile;
      })
      .filter(f => !!f);
    //#endregion

    const langs = this.project.taonJson.generateTranslationsFor;
    // console.log(JSON.stringify(files, null, 2));
    // console.log({ langs });

    type DirnameData = {
      dirnameAbsPath: string;
      interfaces: {
        fileName: string;
        interfaceName: string;
      }[];
    };
    const dirnames: {
      [dirname in string]: DirnameData;
    } = {};

    for (let index = 0; index < files.length; index++) {
      let file = files[index];
      const { fileAbsPath } = files[index];

      const dirnamePath = crossPlatformPath(path.dirname(fileAbsPath));
      dirnames[dirnamePath] = dirnames[dirnamePath] || {
        dirnameAbsPath: dirnamePath,
        interfaces: [],
      };

      for (const lang of langs) {
        //#region save po

        (() => {
          let poFileContent = UtilsPoFile.generatePoFileContent([file], lang);
          const i18poAbsPath = crossPlatformPath([
            path.dirname(fileAbsPath),
            i18nFolder,
            `${path.basename(fileAbsPath)}.${lang}.po`,
          ]);

          if (Helpers.exists(i18poAbsPath)) {
            const exitedPoContent =
              UtilsFilesFoldersSync.readFile(i18poAbsPath);
            const tsFromPo = _.first(
              UtilsPoFile.extractPoToJson(exitedPoContent),
            );
            file = UtilsPoFile.mergeGettextFile(file, tsFromPo);
            poFileContent = UtilsPoFile.generatePoFileContent([file], lang);
          }

          if (Helpers.isFolder(i18poAbsPath)) {
            try {
              fse.unlinkSync(i18poAbsPath);
            } catch (error) {
              Helpers.removeFolderIfExists(i18poAbsPath);
            }
          }
          UtilsFilesFoldersSync.writeFile(i18poAbsPath, poFileContent);
        })();
        //#endregion

        //#region ts from po
        // (() => {
        //   const tsFromPo = _.first(UtilsPoFile.extractPoToJson(poFileContent)); // I 've got on .po per on ts or html file with trasnlation
        //   const i18poTsAbsPath = crossPlatformPath([
        //     path.dirname(fileAbsPath),
        //     i18nFolder,
        //     `${path.basename(fileAbsPath)}.${lang}.po.ts`,
        //   ]);

        //   UtilsFilesFoldersSync.writeFile(i18poTsAbsPath, tsFromPo);
        //   UtilsTypescript.formatFile(i18poTsAbsPath);
        // })();
        //#endregion

        //#region save ts
        (() => {
          const interfaceDataFileName = `${path.basename(fileAbsPath)}.${lang}${i18nDataTsFileExt}`;
          const i18TsAbsPath = crossPlatformPath([
            path.dirname(fileAbsPath),
            i18nFolder,
            interfaceDataFileName,
          ]);
          if (Helpers.isFolder(i18TsAbsPath)) {
            try {
              fse.unlinkSync(i18TsAbsPath);
            } catch (error) {
              Helpers.removeFolderIfExists(i18TsAbsPath);
            }
          }

          const interfaceName = `${_.upperFirst(
            _.camelCase(lang),
          )}TraslationOverride${_.upperFirst(_.camelCase(file.fileRelativePath))}`;

          const getInterface = UtilsPoFile.generateTranslationOverrideInterface(
            file,
            interfaceName,
            lang,
          );

          dirnames[dirnamePath].interfaces.push({
            fileName: interfaceDataFileName,
            interfaceName,
          });

          delete file.fileAbsPath;
          const tsFile = `${THIS_IS_GENERATED_INFO_COMMENT}
${'imp' + 'ort'} type { UtilsPoFile } from '${'@tao' + 'n-dev/' + 'i18n'}/${srcMainProject}';
${'imp' + 'ort'} type { UtilsI18n } from '${'tn' + 'p-core'}/${srcMainProject}';

${getInterface}
${THIS_IS_GENERATED_INFO_COMMENT}
${'exp' + 'ort'} default ${JSON.stringify(file, null, 2)} as UtilsI18n.GettextFile;
${THIS_IS_GENERATED_INFO_COMMENT}
`;

          UtilsFilesFoldersSync.writeFile(i18TsAbsPath, tsFile);
          // UtilsTypescript.formatFile(i18TsAbsPath);
        })();
        //#endregion
      }
    }

    const dirnamesToProcess = Object.keys(dirnames).map(
      c => dirnames[c] as DirnameData,
    );

    for (const dirnameObj of dirnamesToProcess) {
      const i18joinFile = crossPlatformPath([
        dirnameObj.dirnameAbsPath,
        i18nFolder,
        `${path.basename(dirnameObj.dirnameAbsPath)}.translation.ts`,
      ]);

      UtilsFilesFoldersSync.writeFile(
        i18joinFile,
        `${THIS_IS_GENERATED_INFO_COMMENT}
${'imp' + 'ort'} { CoreModels } from '${'tn' + 'p-co' + 're/src'}';

// join interface type here
${dirnameObj.interfaces
  .map(
    c =>
      `${'imp' + 'ort'} { ${c.interfaceName} } from './${c.fileName.replace(/\.ts$/, '')}';`,
  )
  .join('\n')};
export type ${_.upperFirst(
          _.camelCase(path.basename(dirnameObj.dirnameAbsPath)),
        )}Override = CoreModels.DeepPartial<${dirnameObj.interfaces.map(c => `${c.interfaceName}`).join(' \n| ')}>;

 ${THIS_IS_GENERATED_INFO_COMMENT}
        `,
      );
    }

    //#endregion
  }
}
