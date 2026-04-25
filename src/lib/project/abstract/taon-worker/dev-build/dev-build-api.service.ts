import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { DevBuildController } from './dev-build.controller';

@Injectable()
export class DevBuildApiService extends TaonBaseAngularService {
  protected devBuildController = this.injectController(DevBuildController);
}
