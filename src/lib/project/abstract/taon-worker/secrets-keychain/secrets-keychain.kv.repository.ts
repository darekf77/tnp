//#region imports
import {
  TaonBaseRepository,
  TaonRepository,
  TaonBaseKvSyncRepository,
} from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { SecretsKeychainEntity } from './secrets-keychain.entity';
//#endregion

@TaonRepository({
  className: 'SecretsKeychainKvRepository',
})
export class SecretsKeychainKvRepository extends TaonBaseKvSyncRepository {}
