import { CoreModels } from 'tnp-core/src';

import { ReleaseArtifactTaon, ReleaseType } from '../../../../options';

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
  envNumber?: string;
  targetArtifact: ReleaseArtifactTaon;
}

/**
 * Temporary status while adding new deployment
 * already exists in the system
 */
export enum DeploymentsAddingStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
  FAILED = 'failed',
}

export interface DeploymentsAddingStatusObj {
  status: DeploymentsAddingStatus;
}

export interface AllDeploymentsRemoveStatusObj {
  status: AllDeploymentsRemoveStatus;
}

export enum DeploymentsStatus {
  NOT_STARTED = 'not-started',
  STARTING = 'starting',
  STARTED_AND_ACTIVE = 'started-active',
  FAILED_START = 'failed-start',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
}

export enum AllDeploymentsRemoveStatus {
  NOT_STARTED = 'not-started',
  REMOVING = 'removing',
  DONE = 'done',
}

export const DeploymentsStatesAllowedStart: DeploymentsStatus[] = [
  DeploymentsStatus.NOT_STARTED,
  DeploymentsStatus.FAILED_START,
  DeploymentsStatus.STOPPED,
];

export const DeploymentsStatesAllowedStop: DeploymentsStatus[] = [
  DeploymentsStatus.STARTING,
  DeploymentsStatus.STARTED_AND_ACTIVE,
];