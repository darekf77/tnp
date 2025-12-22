import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import { EnvOptions, ReleaseArtifactTaon } from '../../../../../options';
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
  public get baseHrefForGhPages(): string {
    return this.project.name;
  }

  private resolveBaseHrefForProj(envOptions: EnvOptions): string {

    //#region @backendFunc
    const overrideBaseHref: string = envOptions.build.baseHref;
    let baseHref = this.rootBaseHref;

    if (overrideBaseHref === '') {
      baseHref = overrideBaseHref;
    } else {
      if (overrideBaseHref) {
        baseHref = overrideBaseHref;
      } else {
        if (envOptions.release.releaseType) {
          if (envOptions.website.useDomain) {
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

  getBaseHref(envOptions: EnvOptions): string {

    //#region @backendFunc
    let baseHref = this.resolveBaseHrefForProj(envOptions);

    // baseHref = baseHref.endsWith('/') ? baseHref : (baseHref + '/');
    // baseHref = baseHref.startsWith('/') ? baseHref : ('/' + baseHref);
    baseHref = baseHref.replace(/\/\//g, '/');
    return baseHref;
    //#endregion

  }

  replaceBaseHrefInFile(fileAbsPath: string, initOptions: EnvOptions) {

    //#region @backendFunc
    let fileContent = Helpers.readFile(fileAbsPath);
    const frontendBaseHref =
      this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
        initOptions,
      );
    fileContent = fileContent
      .replace('<<<TO_REPLACE_BASENAME>>>', frontendBaseHref)
      .replace('<<<TO_REPLACE_PROJ_NAME>>>', this.project.name);
    Helpers.writeFile(fileAbsPath, fileContent);
    //#endregion

  }
}