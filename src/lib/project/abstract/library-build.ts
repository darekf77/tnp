import { BaseLibraryBuild } from 'tnp-helpers/src';

import type { Project } from './project';

/**
 * TODO implement this some day - taon is handling out of box angular projects
 * => should be easy to implement
 *
 * this is only for angular/typescript projects - not isomorphic projects
 */ // @ts-ignore TODO weird inheritance problem
export class LibraryBuild extends BaseLibraryBuild<Project> {}
