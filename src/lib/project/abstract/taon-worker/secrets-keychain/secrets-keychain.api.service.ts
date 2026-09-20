//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { SecretsKeychainEntity } from './secrets-keychain.entity';
import { SecretsKeychainController } from './secrets-keychain.controller';
//#endregion

@Injectable()
export class SecretsKeychainApiService extends TaonBaseAngularService {
  private secretsKeychainController = this.injectController(SecretsKeychainController);

  public get allMyEntities$(): Observable<SecretsKeychainEntity[]> {
    return this.secretsKeychainController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user: string): Observable<string> {
    return this.secretsKeychainController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}