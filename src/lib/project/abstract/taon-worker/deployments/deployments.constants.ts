import { crossPlatformPath, UtilsOs } from 'tnp-core/src';

export const DEPLOYMENT_LOCAL_FOLDER_PATH = crossPlatformPath([
  UtilsOs.getRealHomeDir(),
  '.taon',
  'deployments',
]);
