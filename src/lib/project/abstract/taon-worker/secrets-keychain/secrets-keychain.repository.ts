//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { SecretsKeychainEntity } from './secrets-keychain.entity';
//#endregion

@TaonRepository({
  className: 'SecretsKeychainRepository',
})
export class SecretsKeychainRepository extends TaonBaseRepository<SecretsKeychainEntity> {
  entityClassResolveFn: () => typeof SecretsKeychainEntity = () => SecretsKeychainEntity;

  /**
   * TODO remove this demo example method
   */
  async countEntitesWithEvenId(): Promise<number> {
    //#region @websqlFunc
    const result = await this.count({
      where: {
        id: Raw(alias => `${alias} % 2 = 0`),
      },
    });
    return result;
    //#endregion
  }
}