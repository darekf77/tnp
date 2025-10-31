//#region imports
import { Taon, ClassHelpers } from 'taon/src';
import { _, dateformat, Helpers } from 'tnp-core/src';
import { BaseCliWorkerController } from 'tnp-helpers/src';

import { Processes } from './processes';
import { ProcessesRepository } from './processes.repository';
//#endregion

@Taon.Controller({
  className: 'ProcessesWorkerController',
})
export class ProcessesWorkerController extends BaseCliWorkerController {}
