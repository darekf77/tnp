import { TaonModels } from '../../../taon-models';
import { BaseArtifact } from './base-artifact';

export class ArtifactAngularNodeApp extends BaseArtifact {
  async struct(options: TaonModels.StructOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async init(options) {
    throw new Error('Method not implemented.');
  }

  async build(options) {
    throw new Error('Method not implemented.');
  }

  async release(options) {
    throw new Error('Method not implemented.');
  }

  async deployPublish(options): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
