import type { Project } from '../../../../project';
/**
 * TODO refactor and move to core project
 */
export declare function resolveBrowserPathToAssetFrom(projectTargetOrStandalone: Project, absolutePath: string): string;
/**
 * return ex.
 * my-path-to/asdasd
 * test
 */
export declare function resolvePathToAsset(project: Project, relativePathToLoader: string | string[]): string;
