import { EndpointContext, Taon, TaonBaseContext, TaonContext } from 'taon/src';
import {
  crossPlatformPath,
  GlobalStorage,
  Helpers,
  Utils,
  _,
  taonActionFromParent,
  UtilsOs,
  config,
  tnpPackageName,
} from 'tnp-core/src';

import { EnvOptions } from '../../../../options';
import { Project } from '../../project';
import { TaonProjectResolve } from '../../project-resolve';

import { DevBuildContext } from './dev-build.abstract.context';
import { DevBuildController } from './dev-build.controller';
import { DevBuildRepository } from './dev-build.repository';

export namespace DevBuildUtils {
  export const context = Taon.createContext(() => ({
    contextName: `ProjectActionContext`,
    contexts: { TaonBaseContext, DevBuildContext },
    database: false,
    kv_database: {
      dbLocationFn: ({
        cwd,
        port,
        baseLocation,
        contextName,
        repositoryClassName,
      }) => {
        return crossPlatformPath([
          baseLocation,
          _.kebabCase(cwd.replace(/\./g, '___')), // each cwd and proces has diffrent db
          `kv_${contextName}__${repositoryClassName}___port${port}.json`,
        ]);
      },
    },
    logs: {
      // routes: true,
      // db: true,
    },
    disabledRealtime: true,
    skipWritingServerRoutes: true,
  }));

  const contexts = new Map<number, EndpointContext>();
  export const startAcionWorker = async () => {
    //#region @backendFunc

    const currentActionPort = await Utils.getFreePort({
      startFrom: 7777,
    });
    const workerMainContext = context.cloneAsNormal({
      overrideHost: `http://localhost:${currentActionPort}`,
    });
    const wokerMainContextRef = await workerMainContext.initialize({
      // onlyMigrationRun,
    });
    contexts.set(currentActionPort, wokerMainContextRef);

    Helpers.logInfo(`Server started`);

    const devBuildController =
      await wokerMainContextRef.getInstanceBy(DevBuildController);

    const devBuildRepository =
      await wokerMainContextRef.getInstanceBy(DevBuildRepository);

    const exitProgramCleaningFn = async () => {
      return await new Promise<void>(async resolve => {
        Helpers.getIsVerboseMode() && console.log('KILLING ACTION WORKER(S)');
        for (const buildProj of devBuildRepository.allProjectsInProcess()) {
          try {
            await devBuildRepository.deleteFromPool(buildProj);
          } catch (error) {
            config.frameworkName === tnpPackageName && console.error(error);
            Helpers.warn(
              `Not able to delete project from main worker projecs pool`,
            );
          }
        }
        for (const buildProj of devBuildRepository.allProjectsInProcess()) {
          try {
            await contexts.get(Number(buildProj.port)).destroy();
          } catch (error) {
            config.frameworkName === tnpPackageName && console.error(error);
            Helpers.warn(
              `Not able to delete destry context for ${buildProj.nameForNpmPackage} ` +
                `(port=${buildProj.port})`,
            );
          }
        }
        Helpers.getIsVerboseMode() && console.log('FINAL EXIT');
        Helpers.removeFileIfExists(devBuildRepository.jsonDbLocation);
        resolve();
      });
    };

    return {
      devBuildController,
      devBuildRepository,
      exitProgramCleaningFn,
      currentActionPort,
    } as Partial<TaonProjectResolve>;
    //#endregion
  };
}
