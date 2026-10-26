//#region imports
import {
  CoreModels,
  _,
  crossPlatformPath,
  path,
  dateformat,
  UtilsDotFile,
} from 'tnp-core/src';

import { dotEnvFile } from '../../../../constants';
import { Models } from '../../../../models';
import { EnvOptions } from '../../../../options';
import { Project } from '../../project';
//#endregion

export namespace ArtifactsAngularNodeAppHelpers {
  export const updateReleasDotEnv = async (
    contextsNames: Models.TaonContext[],
    localReleaseOutputBasePath: string,
    project: Project,
    releaseOptions: EnvOptions,
  ) => {
    //#region @backendFunc

    const useDomain = releaseOptions.website.useDomain;
    const domain = releaseOptions.website.domain;

    // create one env file for all docker containers
    for (let i = 0; i < contextsNames.length; i++) {
      const contextRealIndex = i + 1; // start from 1
      const contextName = contextsNames[i].contextName;
      const taskNameBackendReleasePort =
        `docker release ${domain} ${releaseOptions.release.releaseType} ` +
        `backend port for ${contextName} (n=${contextRealIndex})`;
      const portBackendRelease = await project.registerAndAssignPort(
        taskNameBackendReleasePort,
      );

      const taskNameFrontendreleasePort =
        `docker release ${domain} ${releaseOptions.release.releaseType} ` +
        `frontend port for ${contextName} (n=${contextRealIndex})`;
      const portFrontendRelease = await project.registerAndAssignPort(
        taskNameFrontendreleasePort,
      );

      // const unknownProtocol = `https://`;

      // const domainForContextFE = useDomain
      //   ? domain.startsWith('http')
      //     ? domain
      //     : `${unknownProtocol}${domain}`
      //   : `http://localhost:${portFrontendRelease}`;

      const domainForContextFE = useDomain
        ? domain
        : `http://localhost:${portFrontendRelease}`;

      // const domainForContextBE = useDomain
      //   ? domain.startsWith('http')
      //     ? domain
      //     : `${unknownProtocol}${domain}`
      //   : `http://localhost:${portBackendRelease}`;

      const domainForContextBE = useDomain
        ? domain
        : `http://localhost:${portBackendRelease}`;

      UtilsDotFile.setValuesKeysFromObject(
        [localReleaseOutputBasePath, dotEnvFile],
        {
          [`HOST_BACKEND_PORT_${contextRealIndex}`]: portBackendRelease,
          [`HOST_URL_${contextRealIndex}`]: domainForContextBE,
          [`FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`]: portFrontendRelease,
          [`FRONTEND_HOST_URL_${contextRealIndex}`]: domainForContextFE,

          ...(i === 0 // fallback to old taon app.hosts values
            ? {
                [`HOST_BACKEND_PORT`]: portBackendRelease,
                [`HOST_URL`]: domainForContextBE,
                [`FRONTEND_NORMAL_APP_PORT`]: portFrontendRelease,
                [`FRONTEND_HOST_URL`]: domainForContextFE,
              }
            : {}),
        },
      );

      UtilsDotFile.setCommentToKeyInDotFile(
        [localReleaseOutputBasePath, dotEnvFile],
        `HOST_BACKEND_PORT_${contextRealIndex}`,
        `${CoreModels.tagForTaskName}="${taskNameBackendReleasePort}"`,
      );

      if (i === 0) {
        UtilsDotFile.setCommentToKeyInDotFile(
          [localReleaseOutputBasePath, dotEnvFile],
          `HOST_BACKEND_PORT`,
          `${CoreModels.tagForTaskName}="${taskNameBackendReleasePort}"`,
        );
      }
      UtilsDotFile.setCommentToKeyInDotFile(
        [localReleaseOutputBasePath, dotEnvFile],
        `FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`,
        `${CoreModels.tagForTaskName}="${taskNameFrontendreleasePort}"`,
      );
    }

    if (!useDomain) {
      UtilsDotFile.addCommentAtTheBeginningOfDotFile(
        [localReleaseOutputBasePath, dotEnvFile],
        `HINT! IF YOU NEED DOMAIN USE userDomain=true in env.ts`,
      );
    }

    if (!releaseOptions.build.cloudflare) {
      UtilsDotFile.setValueToDotFile(
        [localReleaseOutputBasePath, '.env'],
        'COMPOSE_PROJECT_NAME',
        (
          'TaonDeployment__' +
          _.camelCase(releaseOptions.website.domain) +
          '__' +
          `v${_.kebabCase(project.packageJson.version)}` +
          '__' +
          `release-type-${releaseOptions.release.releaseType}` +
          `--env--${
            !releaseOptions.release.envName ||
            releaseOptions.release.envName === '__'
              ? 'default'
              : releaseOptions.release.envName
          }${releaseOptions.release.envNumber || ''}`
        ).toLowerCase(),
      );
    }

    if (!releaseOptions.build.cloudflare) {
      UtilsDotFile.setValueToDotFile(
        [localReleaseOutputBasePath, dotEnvFile],
        'BUILD_DATE',
        `${dateformat(new Date(), 'dd-mm-yyyy_HH:MM:ss')}`,
      );

      UtilsDotFile.setValueToDotFile(
        [localReleaseOutputBasePath, dotEnvFile],
        'NODE_ENV',
        `production`,
      );
    }

    //#endregion
  };
}
