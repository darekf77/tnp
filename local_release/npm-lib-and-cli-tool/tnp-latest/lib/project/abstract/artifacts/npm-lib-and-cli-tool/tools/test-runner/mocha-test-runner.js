"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MochaTestRunner = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../constants");
const base_test_runner_1 = require("./base-test-runner");
class MochaTestRunner extends base_test_runner_1.BaseTestRunner {
    fileCommand(files) {
        return this.getCommonFilePattern('src/tests', files, ['.test.ts']);
    }
    async start(files, debug = false) {
        let command;
        command = command =
            `npm-run mocha  ${debug ? '--inspect' : ''} --require ts-node/register ${this.fileCommand(files)} ` +
                ` --timeout ${constants_1.UNIT_TEST_TIMEOUT} `;
        this.project.run(command, { output: true }).sync();
    }
    async startAndWatch(files, debug = false) {
        //#region @backendFunc
        if (this.project.typeIsNot(lib_1.LibTypeEnum.ISOMORPHIC_LIB)) {
            lib_2.Helpers.error(`Tests not impolemented for ${this.project.type}`, false, true);
        }
        let command = `npm-run mocha  ${debug ? '--inspect' : ''} --require ts-node/register ${this.fileCommand(files)} ` +
            `--watch --watch-files src/tests/**/* --timeout ${constants_1.UNIT_TEST_TIMEOUT} `;
        command = lib_2.Helpers._fixCommand(command);
        lib_2.Helpers.run(command, {
            stdio: ['pipe', 'pipe', 'pipe'],
            // env: { ...process.env, FORCE_COLOR: '1' },
            cwd: this.project.location,
        }).async();
        //#endregion
    }
}
exports.MochaTestRunner = MochaTestRunner;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/test-runner/mocha-test-runner.js.map