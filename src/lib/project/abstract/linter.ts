import { BaseLinter } from 'tnp-helpers/src';

import type { Project } from './project';

export class Linter // @ts-ignore TODO weird inheritance problem
  extends BaseLinter<Project>
{
  //#region getters & methods / should not enable lint and prettier
  isEnableForProject(): boolean {
    return this.project.typeIs('isomorphic-lib');
  }
  //#endregion
}
