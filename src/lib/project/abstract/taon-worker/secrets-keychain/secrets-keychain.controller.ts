//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
  Body,
  POST,
  DELETE,
} from 'taon/src';
import { _ } from 'tnp-core/src';
import { TaonBaseCliWorkerController } from 'tnp-helpers/src';

import { SecretsKeychainEntity } from './secrets-keychain.entity';
import { SecretsKeychainKvRepository } from './secrets-keychain.kv.repository';
import { SecretsKeychainRepository } from './secrets-keychain.repository';
//#endregion

@TaonController<SecretsKeychainController>({
  className: 'SecretsKeychainController',
})
export class SecretsKeychainController extends TaonBaseCliWorkerController {
  //#region get all for framework version

  secretsKeychainKvRepository = this.injectKvRepository(
    SecretsKeychainKvRepository,
  );

  @POST()
  getMasterPassword(
    @Query('projectLocation') projectLocation: string,
  ): Taon.Response<string> {
    //#region @backendFunc
    return async (req, res) => {
      return this.secretsKeychainKvRepository.get(projectLocation) || '';
    };
    //#endregion
  }

  @POST()
  setMasterPassword(
    @Body('projectLocation') projectLocation: string,
    @Body('masterPassword') masterPassword: string,
  ): Taon.Response<void> {
    //#region @backendFunc
    return async (req, res) => {
      this.secretsKeychainKvRepository.set(projectLocation, masterPassword);
      this.secretsKeychainKvRepository.expire(projectLocation, 3600 * 24); // keep pass for 1 day
    };
    //#endregion
  }

  @DELETE()
  forgetMasterPassword(
    @Query('projectLocation') projectLocation: string,
  ): Taon.Response<void> {
    //#region @backendFunc
    return async (req, res) => {
      this.secretsKeychainKvRepository.delete(projectLocation);
    };
    //#endregion
  }

  @GET()
  getAllProjectLocationsSaved(): Taon.Response<string[]> {
    //#region @backendFunc
    return async (req, res) => {
      return Object.keys(
        this.secretsKeychainKvRepository.getAllData() || {},
      ).filter(f => !!f);
    };
    //#endregion
  }
}
