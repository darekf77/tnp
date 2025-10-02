import { CoreModels } from 'tnp-core/src';

import { ReleaseArtifactTaon, ReleaseType } from '../../../../options';

/**
 * Based on this data  - system recognizes if stuff
 * is unique and what to do with it
 */
export interface DeploymentReleaseData {
  projectName: string;
  releaseType: ReleaseType;
  version: string;
  envName: CoreModels.EnvironmentNameTaon;
  envNumber: string;
  targetArtifact: ReleaseArtifactTaon;
}

export type DeploymentStatus =
  | 'not-started'
  | 'in-progress'
  | 'stopping'
  // | 'done' // TODO how to recognize when docker compose up done ?
  | 'error';
