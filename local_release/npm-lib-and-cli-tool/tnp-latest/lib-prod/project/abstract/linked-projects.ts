import { BaseNpmHelpers } from 'tnp-helpers/lib-prod';
import { BaseLinkedProjects } from 'tnp-helpers/lib-prod';

import type { Project } from './project';

// @ts-ignore TODO weird inheritance problem
export class LinkedProjects extends BaseLinkedProjects<Project> {}