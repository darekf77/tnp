import { BaseNpmHelpers } from 'tnp-helpers/src';
import { BaseLinkedProjects } from 'tnp-helpers/src';

import type { Project } from './project';

// @ts-ignore TODO weird inheritance problem
export class LinkedProjects extends BaseLinkedProjects<Project> {}
