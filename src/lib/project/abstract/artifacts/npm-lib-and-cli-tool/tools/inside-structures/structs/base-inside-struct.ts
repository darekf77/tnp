import { BuildOptions, InitOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
import { InsideStruct } from '../inside-struct';

/**
 * @deprecated
 */
export class BaseInsideStruct {
  get websql() {
    return this.initOptions?.websql;
  }

  public struct: InsideStruct;
  constructor(
    public readonly project: Project,
    public readonly initOptions: InitOptions,
  ) {
    this.initOptions = initOptions;
  }
}
