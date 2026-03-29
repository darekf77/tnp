import { UtilsOs__NS__isRunningInWindowsPowerShell } from 'tnp-core/lib-prod';
import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { srcMainProject } from '../../../../../../constants';
// @ts-ignore TODO weird inheritance problem
export class BaseTestRunner extends BaseFeatureForProject {
    async run(baseFolderForCode, command) {
        await this.project.execute(command, {
            askToTryAgainOnError: true,
            outputLineReplace: (line) => {
                //#region replace outut line for better debugging
                // console.log('LINE:', line);
                line = line.replace(baseFolderForCode + '/', srcMainProject + '/');
                return line;
            },
        });
    }
    getCommonFilePattern(where, files, extensions = ['test.ts']) {
        //#region @backendFunc
        const base = where.replace(/\/$/, '');
        const isRunningInPowerSHell = UtilsOs__NS__isRunningInWindowsPowerShell();
        console.log({ isRunningInPowerSHell });
        const cleanFiles = (files ?? []).map(f => f.trim()).filter(Boolean);
        const extGroup = extensions.length > 1
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/test-runner/base-test-runner.js.map