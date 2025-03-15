import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import { InitOptions, ReleaseArtifactTaon } from '../../../../../options';
import type { Project } from '../../../project';

/**
 * Base href can be:
 *
 * '' - for electron release build ( / - doesn't work in file system)
 * '/' - root
 * '/my-base-href/'
 *
 */ // @ts-ignore TODO weird inheritance problem
export class AngularFeBasenameManager extends BaseFeatureForProject<Project> {
  public readonly rootBaseHref: string = '/';
  private get baseHrefForGhPages() {
    return this.project.name;
  }

  private resolveBaseHrefForProj(overrideBaseHref: string, releaseType?: ReleaseArtifactTaon) {
    //#region @backendFunc
    let baseHref = this.rootBaseHref;

    if (overrideBaseHref === '') {
      baseHref = overrideBaseHref;
    } else {
      if (overrideBaseHref) {
        baseHref = overrideBaseHref;
      } else {
        if (releaseType) {
          if (
            this.project.artifactsManager.globalHelper.env.config?.useDomain
          ) {
            baseHref = this.rootBaseHref;
          } else {
            baseHref = `/${this.baseHrefForGhPages}/`;
          }
        }
      }
    }

    return baseHref;
    //#endregion
  }

  getBaseHref(initOptions: InitOptions) {
    //#region @backendFunc
    let baseHref = this.resolveBaseHrefForProj(initOptions.baseHref);

    // baseHref = baseHref.endsWith('/') ? baseHref : (baseHref + '/');
    // baseHref = baseHref.startsWith('/') ? baseHref : ('/' + baseHref);
    baseHref = baseHref.replace(/\/\//g, '/');
    return baseHref;
    //#endregion
  }

  replaceBaseHrefInFile(fileAbsPath: string, initOptions: InitOptions) {
    //#region @backendFunc
    let fileContent = Helpers.readFile(fileAbsPath);
    const frontendBaseHref =
      this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
        initOptions,
      );
    fileContent = fileContent.replace(
      '<<<TO_REPLACE_BASENAME>>>',
      frontendBaseHref,
    );
    Helpers.writeFile(fileAbsPath, fileContent);
    //#endregion
  }
}
