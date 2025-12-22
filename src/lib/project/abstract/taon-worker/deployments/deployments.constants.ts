import { crossPlatformPath, dotTaonFolder, UtilsOs } from 'tnp-core/src';

export const DEPLOYMENT_LOCAL_FOLDER_PATH = crossPlatformPath([
  UtilsOs.getRealHomeDir(),
  dotTaonFolder,
  'deployments',
]);