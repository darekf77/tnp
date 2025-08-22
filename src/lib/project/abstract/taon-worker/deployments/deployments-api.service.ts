//#region imports
import { Injectable } from '@angular/core'; // @browser
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon } from 'taon/src';

import type { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';
//#endregion

//#region @browser
@Injectable()
//#endregion
export class DeploymentsApiService extends Taon.Base.AngularService {
  private deploymentsController: DeploymentsController;

  public get allMyEntities$(): Observable<Deployments[]> {
    return this.deploymentsController
      .getEntities()
      .request().observable.pipe(map(res => res.body.json));
  }

  constructor() {
    super();
    this.deploymentsController = Taon.inject(() =>
      this.currentContext.getClass(DeploymentsController),
    );
  }
}
