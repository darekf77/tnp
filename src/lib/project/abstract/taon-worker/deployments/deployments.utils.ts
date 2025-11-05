import { debounceTime, exhaustMap, map, Subscription } from 'rxjs';
import { Helpers, UtilsTerminal } from 'tnp-core/src';

import { ProcessesController } from '../processes';
import { ProcessesUtils } from '../processes/processes.utils';

import { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';

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
    await ProcessesUtils.displayRealtimeProgressMonitor(
      deployment.processIdComposeUp,
      processesController,
      options,
    );
    //#endregion
  };
  //#endregion
}
