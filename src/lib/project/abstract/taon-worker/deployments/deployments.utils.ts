import { ProcessesController } from '@taon-dev/cloud/src';
import { ProcessesUtils } from '@taon-dev/cloud/src';

import { Deployments } from './deployments';

export namespace DeploymentsUtils {
  //#region display deployment progress
  export const displayRealtimeProgressMonitor = async (
    deployment: Deployments,
    processesController: ProcessesController,
    options?: {
      resolveWhenTextInOutput?: string;
    },
  ): Promise<void> => {
    //#region @backendFunc
    if (!deployment) {
      throw new Error(`deployment is required`);
    }
    if (!deployment.processIdComposeUp) {
      throw new Error(`deployment.processIdComposeUp is required`);
    }

    await ProcessesUtils.displayRealtimeProgressMonitor(
      deployment.processIdComposeUp,
      processesController,
      options,
    );
    //#endregion
  };
  //#endregion
}
