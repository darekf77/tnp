//#region imports
import {
  CustomColumn, Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { SecretsKeychainDefaultsValues } from './secrets-keychain.constants';
//#endregion

@TaonEntity({
  className: 'SecretsKeychainEntity',
  createTable: true,
})
export class SecretsKeychainEntity extends TaonBaseAbstractEntity<SecretsKeychainEntity> {
  //#region @websql
  @CustomColumn({
    type: 'varchar',
    length: 100,
    default: SecretsKeychainDefaultsValues.description,
  })
  //#endregion
  description?: string;
}