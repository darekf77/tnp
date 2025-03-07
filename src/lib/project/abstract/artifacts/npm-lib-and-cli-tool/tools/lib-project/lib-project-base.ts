import { config } from 'tnp-config/src';
import { _ } from 'tnp-core/src';
import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import type { Project } from '../../../../project';

// @ts-ignore TODO weird inheritance problem
export abstract class LibProjectBase extends BaseFeatureForProject<Project> {
  //#region build docs
  abstract buildDocs(
    prod: boolean,
    realCurrentProj: Project,
    automaticReleaseDocs: boolean,
    libBuildCallback: (websql: boolean, prod: boolean) => any,
  ): Promise<boolean>;
  //#endregion

  //#region publish
  abstract publish(options: {
    realCurrentProj: Project;
    newVersion: string;
    automaticRelease: boolean;
    prod: boolean;
    rootPackageName?: string;
  }): Promise<any>;
  //#endregion

  //#region prepare pacakge
  abstract preparePackage(smartContainer: Project, newVersion: string);
  //#endregion

  //#region update core/special projects/container
  async updateTnpAndCoreContainers(
    realCurrentProj: Project,
    newVersion: string,
  ): Promise<void> {
    //#region @backendFunc

    const allVersions = Helpers.uniqArray([
      ...config.activeFramewrokVersions,
      realCurrentProj.framework.frameworkVersion,
    ]);

    const coreContainters = [
      this.project.framework.coreContainer,
      ...(allVersions.map(v =>
        this.project.ins.by('container', v),
      ) as Project[]),
    ];

    const tnpProj = this.project.ins.Tnp;
    const updateLocalTaonProjectWithOwnNodeModules =
      config.frameworkName === 'tnp' &&
      realCurrentProj.name !== 'tnp' &&
      allVersions.includes(tnpProj.framework.frameworkVersion);

    const projectForCodeUpdate = [
      ...(updateLocalTaonProjectWithOwnNodeModules ? [tnpProj] : []),
      ...coreContainters,
    ].filter(f => !!f);

    for (const coreContainer of coreContainters) {
      // console.log(
      //   `[updateTnpAndCoreContainers] Updating ${coreContainer.genericName}...`,
      // );
      for (const packageName of realCurrentProj.framework
        .packageNamesFromProject) {


        coreContainer.packageJson.updateDependency({
          packageName: packageName,
          version: newVersion,
        });

        coreContainer.taonJson.packageJsonOverride.updateDependency({
          packageName: packageName,
          version: newVersion,
        });
      }
    }

    for (const projToUpdate of projectForCodeUpdate) {
      await projToUpdate.nodeModules.updateFromReleaseDist(realCurrentProj);
      Helpers.taskDone(
        'Done updating core container: ' + projToUpdate.genericName,
      );
    }

    //#endregion
  }
  //#endregion
}
