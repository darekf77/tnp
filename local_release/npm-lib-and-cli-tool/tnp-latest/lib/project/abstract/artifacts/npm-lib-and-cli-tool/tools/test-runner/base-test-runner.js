"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTestRunner = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../constants");
// @ts-ignore TODO weird inheritance problem
class BaseTestRunner extends lib_2.BaseFeatureForProject {
    async run(baseFolderForCode, command) {
        await this.project.execute(command, {
            askToTryAgainOnError: true,
            outputLineReplace: (line) => {
                //#region replace outut line for better debugging
                // console.log('LINE:', line);
                line = line.replace(baseFolderForCode + '/', constants_1.srcMainProject + '/');
                return line;
            },
        });
    }
    getCommonFilePattern(where, files, extensions = ['test.ts']) {
        //#region @backendFunc
        const base = where.replace(/\/$/, '');
        const isRunningInPowerSHell = lib_1.UtilsOs.isRunningInWindowsPowerShell();
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
exports.BaseTestRunner = BaseTestRunner;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/test-runner/base-test-runner.js.map