import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../../../../options';
import type { Project } from '../../../project';
/**
 * Base href can be:
 *
 * '' - for electron release build ( / - doesn't work in file system)
 * '/' - root
 * '/my-base-href/'
 *
 */ export declare class AngularFeBasenameManager extends BaseFeatureForProject<Project> {
    readonly rootBaseHref: string;
    getBaseHrefForGhPages(envOptions: EnvOptions): string;
    private resolveBaseHrefForProj;
    getBaseHref(envOptions: EnvOptions): string;
    replaceBaseHrefInFile(fileAbsPath: string, initOptions: EnvOptions): void;
}
