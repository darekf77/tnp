import { CoreModels } from 'tnp-core/src';

import { ReleaseArtifactTaon, ReleaseType } from '../../../../options';
import { stat } from 'fs';

/**
 * Based on this data  - system recognizes if stuff
 * is unique and what to do with it
 */
export interface DeploymentReleaseData {
  projectName: string;
  destinationDomain: string;
  releaseType: ReleaseType;
  version: string;
  envName: CoreModels.EnvironmentNameTaon;
  envNumber: string;
  targetArtifact: ReleaseArtifactTaon;
}

export type DeploymentsAddingStatus = 'not-started' | 'started' | 'done';

export interface DeploymentsAddingStatusObj {
  status: DeploymentsAddingStatus;
}

export const DeploymentStatusNotAllowedToStart = [
  'in-progress',
  'starting',
  'stopping',
];

export type DeploymentStatus =
  | 'not-started' // process not started/assigned
  | 'starting' // prepering stuff for starting processs
  | 'in-progress' // proces started
  | 'stopping' // stopping process
  | 'removing' // stopping process
  | 'success' // process triggered success message
  | 'error';
