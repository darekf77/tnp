//#region imports
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { DevModeController } from './dev-mode.controller';
//#endregion

@Injectable()
export class DevModeApiService extends TaonBaseAngularService {
  private devModeController = this.injectController(DevModeController);

  // public get allMyEntities$(): Observable<DevMode[]> {
  //   return this.devModeController.allData().request!().observable.pipe(
  //     map(res => res.body.json),
  //   );
  // }
}
