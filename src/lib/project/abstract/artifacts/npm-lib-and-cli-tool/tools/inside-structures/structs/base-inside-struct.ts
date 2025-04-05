import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
import { InsideStruct } from '../inside-struct';

/**
 * @deprecated
 */
export class BaseInsideStruct {
  get websql() {
    return this.initOptions?.build.websql;
  }

  public struct: InsideStruct;
  constructor(
    public readonly project: Project,
    public readonly initOptions: EnvOptions,
  ) {
    this.initOptions = initOptions;
  }
}
