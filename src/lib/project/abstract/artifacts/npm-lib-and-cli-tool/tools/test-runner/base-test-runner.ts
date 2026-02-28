import { Project } from 'tnp/src';
import { path, _, UtilsOs } from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

// @ts-ignore TODO weird inheritance problem
export abstract class BaseTestRunner extends BaseFeatureForProject<Project> {
  abstract start(files: string[], debug: boolean): Promise<void>;

  abstract startAndWatch(files: string[], debug: boolean): Promise<void>;

  abstract fileCommand(files: string[]): string;

  getCommonFilePattern(
    where: 'src' | 'e2e' | 'src/tests',
    files?: string[],
    extensions: string[] = ['test.ts'],
  ): string {
    //#region @backendFunc
    const base = where.replace(/\/$/, '');

    const isRunningInPowerSHell = UtilsOs.isRunningInWindowsPowerShell();
    console.log({ isRunningInPowerSHell });

    const cleanFiles = (files ?? []).map(f => f.trim()).filter(Boolean);

    const extGroup =
      extensions.length > 1
        ? `.{${extensions.join(',')}}`
        : `.${extensions[0]}`;

    // No file filters → whole folder
    if (cleanFiles.length === 0) {
      if (isRunningInPowerSHell) {
        return `"${base}/**/*${extGroup}"`;
      }
      return `${base}/**/*${extGroup}`;
    }

    // Single exact test file
    if (cleanFiles.length === 1) {
      const file = cleanFiles[0];

      if (extensions.some(e => file.endsWith(e))) {
        if (isRunningInPowerSHell) {
          return `"${base}/**/*${file}"`;
        }
        return `${base}/**/*${file}`;
      }

      if (isRunningInPowerSHell) {
        return `"${base}/**/*${file}*${extGroup}"`;
      }
      return `${base}/**/*${file}*${extGroup}`;
    }

    // Multiple files
    const group = `{${cleanFiles.join(',')}}`;

    if (isRunningInPowerSHell) {
      return `"${base}/**/*${group}*${extGroup}"`;
    }

    return `${base}/**/*${group}*${extGroup}`;
    //#endregion
  }
}
