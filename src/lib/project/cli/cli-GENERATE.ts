//#region imports
import { MagicRenamer } from 'magic-renamer/src';
import {
  backendNodejsOnlyFiles,
  config,
  extAllowedToExportAndReplaceTSJSCodeFiles,
  frontendFiles,
  LibTypeEnum,
  notNeededForExportFiles,
  TAGS,
} from 'tnp-core/src';
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
import {
  BaseCommandLineFeature,
  Helpers,
  HelpersTaon,
  UtilsTypescript,
} from 'tnp-helpers/src';

import {
  appFromSrc,
  DEFAULT_FRAMEWORK_VERSION,
  srcFromTaonImport,
  srcMainProject,
} from '../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion

/**
 * TODO refactor move to tnp-helpers
 */ // @ts-ignore TODO weird inheritance problem
export class $Generate extends BaseCli {
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
      LibTypeEnum.CONTAINER,
      nearestProj.framework.frameworkVersion,
    ) as Project;
    if (container.framework.frameworkVersionLessThan('v3')) {
      container = this.project.ins.by(
        LibTypeEnum.CONTAINER,
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
        this.project.framework.generateIndexTs(absPath);
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

      if (moduleName === 'refactor-class-into-namespace') {
        if (!Helpers.isFolder(absFilePath)) {
          const content = Helpers.readFile(absFilePath);
          Helpers.writeFile(
            absFilePath,
            UtilsTypescript.refactorClassToNamespace(content),
          );
        }
      }
      //#endregion
    } else {
      const ins = MagicRenamer.Instance(exampleLocation);
      ins.start(`${myEntity} -> ${newEntityName}`);
      if (isFlat) {
        const files = Helpers.filesFrom(generatedCodeAbsLoc, true);
        for (let index = 0; index < files.length; index++) {
          const fileAbsPath = crossPlatformPath(files[index]);
          const relative = fileAbsPath.replace(generatedCodeAbsLoc + '/', '');
          const destFileAbsPath = crossPlatformPath([destination, relative]);
          HelpersTaon.copyFile(fileAbsPath, destFileAbsPath);
        }
        Helpers.remove(generatedCodeAbsLoc, true);
      } else {
        HelpersTaon.copy(generatedCodeAbsLoc, destination);
        Helpers.remove(generatedCodeAbsLoc, true);
      }
      //#region fixing active context imports
      if (
        moduleName === 'dummy-angular-standalone-container' ||
        moduleName === 'taon-active-context'
      ) {
        const activeContextAbsFilePath = crossPlatformPath([
          destination,
          `${newEntityName}.active.context.ts`,
        ]);

        const relativePath = activeContextAbsFilePath
          .replace(nearestProj.pathFor([srcMainProject, appFromSrc]) + '/', '')
          .replace('.ts', '');
        const back = _.times(relativePath.split('/').length, () => '..').join(
          '/',
        );
        const replaceTag = '@generated-imports-here';
        let orgContent = Helpers.readFile(activeContextAbsFilePath);
        orgContent = UtilsTypescript.addBelowPlaceholder(
          orgContent,
          replaceTag,
          `import { HOST_CONFIG } from '${back}/app.hosts';
import { MIGRATIONS_CLASSES_FOR_${_.upperFirst(_.camelCase(newEntityName))}ActiveContext }` +
            ` from '${this.project.nameForNpmPackage}/${srcFromTaonImport}';`,
        );

        Helpers.writeFile(
          activeContextAbsFilePath,
          orgContent.replace(replaceTag, ''),
        );
      }
      //#endregion
    }
    if (this.project?.taonJson.shouldGenerateAutogenIndexFile) {
      await this.project.artifactsManager.artifact.npmLibAndCliTool.indexAutogenProvider.runTask(
        {
          watch: false,
        },
      );
      await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask(
        {
          watch: false,
        },
      );
    }
    console.info('GENERATION DONE');
    this._exit(0);
    //#endregion
  }

  async libIndex() {
    //#region @backendFunc
    await this.project.framework.generateLibIndex();
    this._exit();
    //#endregion
  }

  async appRoutes() {
    //#region @backendFunc
    await this.project.framework.generateAppRoutes();
    this._exit();
    //#endregion
  }

  fieldsWebsqlRegions() {
    //#region @backendFunc
    const fileAbsPath = crossPlatformPath(this.firstArg);
    const content = Helpers.readFile(fileAbsPath);
    const fixedRegions =
      UtilsTypescript.wrapContentClassMembersDecoratorsWithRegion(
        content,
        `${TAGS.WEBSQL}`,
      );
    if (content !== fixedRegions) {
      Helpers.writeFile(fileAbsPath, fixedRegions);
      UtilsTypescript.formatFile(fileAbsPath);
    }
    this._exit(0);
    //#endregion
  }
}

export default {
  $Generate: HelpersTaon.CLIWRAP($Generate, '$Generate'),
};
