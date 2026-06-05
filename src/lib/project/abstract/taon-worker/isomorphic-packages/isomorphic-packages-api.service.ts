//#region imports
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { IsomorphicPackagesController } from './isomorphic-packages.controller';
//#endregion

@Injectable()
export class IsomorphicPackagesApiService extends TaonBaseAngularService {
  private isomorphicPackagesController = this.injectController(
    IsomorphicPackagesController,
  );

  // public get allMyEntities$(): Observable<IsomorphicPackages[]> {
  //   return this.isomorphicPackagesController.getEntities().request!().observable.pipe(
  //     map(res => res.body.json),
  //   );
  // }
}
