import { config } from 'tnp-config/src';
import { _ } from 'tnp-core/src';
import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import type { Project } from '../../../../project';
/**
 * @deprecated
 */
// @ts-ignore TODO weird inheritance problem
export abstract class LibProjectBase extends BaseFeatureForProject<Project> {
  //#region build docs
  abstract buildDocs(
    prod: boolean,
    autoReleaseUsingConfigDocs: boolean,
    libBuildCallback: (websql: boolean, prod: boolean) => any,
  ): Promise<boolean>;
  //#endregion

  //#region prepare pacakge
  abstract preparePackage(smartContainer: Project, newVersion: string);
  //#endregion
}
