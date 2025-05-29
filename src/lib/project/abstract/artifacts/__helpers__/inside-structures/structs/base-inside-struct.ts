import { EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';
import { InsideStruct } from '../inside-struct';

/**
 * @deprecated
 */
export abstract class BaseInsideStruct {
  abstract relativePaths(): string[];
  abstract insideStruct(): InsideStruct;

  constructor(
    public readonly project: Project,
    public readonly initOptions: EnvOptions,
  ) {}
}
