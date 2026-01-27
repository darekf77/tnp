import { LibTypeEnum } from 'tnp-core/lib-prod';
import { BaseLinter } from 'tnp-helpers/lib-prod';

import type { Project } from './project';

export class Linter // @ts-ignore TODO weird inheritance problem
  extends BaseLinter<Project>
{

  //#region getters & methods / should not enable lint and prettier
  isEnableForProject(): boolean {
    return this.project.typeIs(LibTypeEnum.ISOMORPHIC_LIB);
  }
  //#endregion

}