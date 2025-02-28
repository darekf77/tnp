import { BaseArtifact } from './base-artifact';

export class ArtifactElectronApp extends BaseArtifact {
  async struct(options): Promise<void> {
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
}
