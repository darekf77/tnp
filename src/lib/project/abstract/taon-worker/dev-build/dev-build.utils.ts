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
import { DevBuildModels } from './dev-build.models';
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
      routes: true,
      db: true,
    },
    disabledRealtime: true,
    skipWritingServerRoutes: true,
  }));

  const contexts = new Map<number, EndpointContext>();

  export const startAcionWorker = async (project: Project) => {
    //#region @backendFunc
    const currentActionPort = project.currentActionPort;
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

    const exitProgramCleaningFn = () => {
      return new Promise<void>(async resolve => {
        const allWorkers = devBuildRepository.allProjectsInProcess();
        for (const buildProj of allWorkers) {
          try {
            Helpers.logInfo(
              `Deleting from pool ${buildProj.nameForNpmPackage} ${buildProj.port} ${buildProj.location}`,
            );
            await devBuildRepository.deleteFromPool(buildProj);
          } catch (error) {
            config.frameworkName === tnpPackageName && console.error(error);
            Helpers.logWarn(
              `Not able to delete project from main worker projecs pool`,
            );
          }
        }
        for (const buildProj of allWorkers) {
          try {
            await contexts.get(Number(buildProj.port)).destroy();
          } catch (error) {
            config.frameworkName === tnpPackageName && console.error(error);
            Helpers.logWarn(
              `Not able to delete destry context for ${buildProj.nameForNpmPackage} ` +
                `(port=${buildProj.port})`,
            );
          }
        }
        Helpers.info('Taon Build Exit Cleaning Done');
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
