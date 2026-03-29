import { BaseLinter } from 'tnp-helpers';
import type { Project } from './project';
export declare class Linter// @ts-ignore TODO weird inheritance problem
 extends BaseLinter<Project> {
    isEnableForProject(): boolean;
}