
//// FILE GENERATED BY TNP /////
import { META } from 'morphi';

import { Controllers as BaselineControllers }  from 'baseline/ss-common-logic/src/controllers';
import * as controllersBaseline from 'baseline/ss-common-logic/src/controllers';
export * from 'baseline/ss-common-logic/src/controllers';



import { BuildController } from './controllers/BuildController';
export { BuildController } from './controllers/BuildController';

import { DomainsController } from './controllers/DomainsController';
export { DomainsController } from './controllers/DomainsController';

import { TnpProjectController } from './controllers/TnpProjectController';
export { TnpProjectController } from './controllers/TnpProjectController';

export const Controllers:META.BASE_CONTROLLER<any>[] = [
BuildController,
DomainsController,
TnpProjectController
].concat(BaselineControllers as any) as any;

//#region @backend

import { getSingleton } from "morphi";
import * as _ from 'lodash'

export function controllers<ADDITIONAL={}>(decoratorsControllers?: ADDITIONAL) {
return _.merge(controllersBaseline.controllers(), {

BuildController: getSingleton<BuildController>(BuildController),

DomainsController: getSingleton<DomainsController>(DomainsController),

TnpProjectController: getSingleton<TnpProjectController>(TnpProjectController),
}  );
}
//#endregion
