import { crossPlatformPath, Helpers, Utils, _, UtilsOs } from 'tnp-core/src';
import { DevBuildController } from './dev-build.controller';
import { DevBuildRepository } from './dev-build.repository';
import { EndpointContext, Taon, TaonBaseContext, TaonContext } from 'taon/src';
import { Project } from '../../project';
import { DevBuildContext } from './dev-build.abstract.context';
import { TaonProjectResolve } from '../../project-resolve';
import { EnvOptions } from '../../../../options';

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

  export const startAcionWorker = async () => {
    //#region @backendFunc

    const currentActionPort = await Utils.getFreePort({
      startFrom: 7777,
    });
    const workerMainContext = context.cloneAsNormal({
      overrideHost: `http://localhost:${currentActionPort}`,
    });
    const ref = await workerMainContext.initialize({
      // onlyMigrationRun,
    });

    Helpers.logInfo(`Server started`);

    const devBuildController = await ref.getInstanceBy(DevBuildController);

    const devBuildRepository = await ref.getInstanceBy(DevBuildRepository);

    const exitProgramCleaningFn = async () => {
      return await new Promise<void>(resolve => {
        Helpers.getIsVerboseMode() && console.log('KILLING ACTION WORKER');
        ref.destroy().then(async () => {
          await devBuildRepository.deleteFromPool();
          Helpers.getIsVerboseMode() && console.log('FINAL EXIT');
          Helpers.removeFileIfExists(devBuildRepository.jsonDbLocation);
          resolve();
        });
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
