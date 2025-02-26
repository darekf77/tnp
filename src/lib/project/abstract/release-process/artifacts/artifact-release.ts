import { CoreModels } from 'tnp-core/src';
import type { Project } from '../../project';
import { TaonModels } from '../../../../taon-models';

/**
 * - create temp project for artifact release
 * - manage artifact release
 * - handle errors in artifact release
 */
export class ArtifactRelease {
  constructor(
    protected project: Project,
    protected releaseProcessType: TaonModels.ReleaseProcessType,
  ) {}

  async start() {}

  protected async release() {}
}
