
//// FILE GENERATED BY TNP /////
import { Morphi } from 'morphi';

import { Entities as BaselineEntities }  from 'baseline/ss-common-logic/src/entities';
import * as baslineEntites from 'baseline/ss-common-logic/src/entities';
export * from 'baseline/ss-common-logic/src/entities';



import { PROJECT, IPROJECT } from './apps/project/PROJECT';
export { PROJECT, IPROJECT } from './apps/project/PROJECT';

export const Entities: Morphi.Base.Entity<any>[] = [
PROJECT
].concat(BaselineEntities as any) as any;

//#region @backend


import {   PROJECT_REPOSITORY } from './apps/project/PROJECT_REPOSITORY';
export {   PROJECT_REPOSITORY } from './apps/project/PROJECT_REPOSITORY';

import { Repository } from "typeorm";
export { Repository } from "typeorm";
import * as _ from 'lodash'

export function entities<ADDITIONAL={}>(connection?: Morphi.Orm.Connection, decoratorsEntities?: ADDITIONAL) {
return _.merge(baslineEntites.entities(connection),{

PROJECT: Morphi.Orm.RepositoryFrom<PROJECT , PROJECT_REPOSITORY>(connection, PROJECT , PROJECT_REPOSITORY),
}  );
}
//#endregion
