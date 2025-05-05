//#region @backendFunc
import { MagicRenamer } from 'magic-renamer/src';
import {
  backendNodejsOnlyFiles,
  config,
  extAllowedToExportAndReplaceTSJSCodeFiles,
  frontendFiles,
  notNeededForExportFiles,
  TAGS,
} from 'tnp-config/src';
import {
  chalk,
  _,
  crossPlatformPath,
  glob,
  path,
  UtilsOs,
  UtilsString,
} from 'tnp-core/src';
import { UtilsTerminal } from 'tnp-core/src';
import { BaseCommandLineFeature, Helpers } from 'tnp-helpers/src';

import { DEFAULT_FRAMEWORK_VERSION } from '../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion

/**
 * TODO refactor move to tnp-helpers
 */ // @ts-ignore TODO weird inheritance problem
export class $Generate extends BaseCli {
  //#region generate
  // @ts-ignore TODO weird inheritance problem
  async _() {
    //#region @backendFunc
    let [absPath, moduleName, entityName] = this.args;
    if (!Helpers.exists(absPath)) {
      Helpers.mkdirp(absPath);
    }
    const absFilePath = crossPlatformPath(absPath);
    if (!Helpers.isFolder(absPath)) {
      absPath = crossPlatformPath(path.dirname(absPath));
    }
    entityName = decodeURIComponent(entityName);
    const nearestProj = this.ins.nearestTo(this.cwd) as Project;
    // console.log({
    //   nearestProj: nearestProj?.location
    // })
    let container = this.project.ins.by(
      'container',
      nearestProj.framework.frameworkVersion,
    ) as Project;
    if (container.framework.frameworkVersionLessThan('v3')) {
      container = this.project.ins.by(
        'container',
        DEFAULT_FRAMEWORK_VERSION,
      ) as Project;
    }

    const myEntity = 'my-entity';

    const flags = {
      flat: '_flat',
      custom: '_custom',
    };

    const isFlat = moduleName.includes(flags.flat);
    moduleName = moduleName.replace(flags.flat, '');

    const isCustom = moduleName.includes(flags.custom);
    moduleName = moduleName.replace(flags.custom, '');

    const exampleLocation = crossPlatformPath([
      container.location,
      `gen-examples-${container.framework.frameworkVersion}`,
      moduleName,
      myEntity,
    ]);

    const newEntityName = UtilsString.kebabCaseNoSplitNumbers(entityName);
    const generatedCodeAbsLoc = crossPlatformPath([
      container.location,
      `gen-examples-${container.framework.frameworkVersion}`,
      moduleName,
      newEntityName,
    ]);
    Helpers.remove(generatedCodeAbsLoc, true);
    let destination = crossPlatformPath([absPath, newEntityName]);
    if (isFlat) {
      destination = crossPlatformPath(path.dirname(destination));
    }

    if (isCustom) {
      //#region handle custom cases
      if (moduleName === 'generated-index-exports') {
        const folders = [
          ...Helpers.foldersFrom(absPath).map(f => path.basename(f)),
          ...Helpers.filesFrom(absPath, false).map(f => path.basename(f)),
        ]
          .filter(f => !['index.ts'].includes(f))
          .filter(f => !f.startsWith('.'))
          .filter(f => !f.startsWith('_'))
          .filter(f =>
            _.isUndefined(notNeededForExportFiles.find(e => f.endsWith(e))),
          )
          .filter(
            f =>
              path.extname(f) === '' ||
              !_.isUndefined(
                extAllowedToExportAndReplaceTSJSCodeFiles.find(a =>
                  f.endsWith(a),
                ),
              ),
          );
        Helpers.writeFile(
          crossPlatformPath([absPath, config.file.index_ts]),
          folders
            .map(f => {
              if (
                !_.isUndefined(frontendFiles.find(bigExt => f.endsWith(bigExt)))
              ) {
                // `${TAGS.COMMENT_REGION} ${TAGS.BROWSER}\n` +
                `export * from './${f.replace(path.extname(f), '')}'; // ${TAGS.BROWSER}`;
                // +`\n${TAGS.COMMENT_END_REGION}\n`;
              }
              if (
                !_.isUndefined(
                  backendNodejsOnlyFiles.find(bigExt => f.endsWith(bigExt)),
                )
              ) {
                return (
                  // `${TAGS.COMMENT_REGION} ${TAGS.BACKEND}\n` +
                  `export * from './${f.replace(path.extname(f), '')}'; // ${TAGS.BACKEND}`
                  // +`\n${TAGS.COMMENT_END_REGION}\n`
                );
              }
              return `export * from './${f.replace(path.extname(f), '')}';`;
            })
            .join('\n') + '\n',
        );
      }
      if (moduleName === 'wrap-with-browser-regions') {
        if (!Helpers.isFolder(absFilePath)) {
          const content = Helpers.readFile(absFilePath);
          Helpers.writeFile(
            absFilePath,
            `${TAGS.COMMENT_REGION} ${TAGS.BROWSER}\n` +
              content +
              `\n${TAGS.COMMENT_END_REGION}\n`,
          );
        }
      }
      //#endregion
    } else {
      const ins = MagicRenamer.Instance(exampleLocation);
      ins.start(`${myEntity} -> ${newEntityName}`, true);
      if (isFlat) {
        const files = Helpers.filesFrom(generatedCodeAbsLoc, true);
        for (let index = 0; index < files.length; index++) {
          const fileAbsPath = crossPlatformPath(files[index]);
          const relative = fileAbsPath.replace(generatedCodeAbsLoc + '/', '');
          const destFileAbsPath = crossPlatformPath([destination, relative]);
          Helpers.copyFile(fileAbsPath, destFileAbsPath);
        }
        Helpers.remove(generatedCodeAbsLoc, true);
      } else {
        Helpers.move(generatedCodeAbsLoc, destination);
      }
    }
    console.info('GENERATION DONE');
    this._exit(0);
    //#endregion
  }
  //#endregion
}

export default {
  $Generate: Helpers.CLIWRAP($Generate, '$Generate'),
};
