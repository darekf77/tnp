"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitestTestRunner = void 0;
const constants_1 = require("../../../../../../constants");
const base_test_runner_1 = require("./base-test-runner");
class VitestTestRunner extends base_test_runner_1.BaseTestRunner {
    // CLI should only filter, NOT define extensions
    fileCommand(files = []) {
        if (!files?.length)
            return '';
        return files.map(f => `"${f}"`).join(' ');
    }
    buildCommand(files, watch, debug) {
        const vitestEntry = './node_modules/vitest/vitest.mjs';
        const filter = this.fileCommand(files);
        const mode = watch ? '' : 'run';
        const base = `${vitestEntry} ${mode} ${filter} ` +
            `--environment node ` +
            `--testTimeout ${constants_1.UNIT_TEST_TIMEOUT}`;
        return debug ? `node --inspect-brk ${base}` : `node ${base}`;
    }
    async start(files, debug) {
        //#region @backendFunc
        const command = this.buildCommand(files, false, debug);
        await this.run(constants_1.tmpSourceDist, command);
        //#endregion
    }
    async startAndWatch(files, debug) {
        //#region @backendFunc
        const command = this.buildCommand(files, true, debug);
        await this.run(constants_1.tmpSourceDist, command);
        //#endregion
    }
}
exports.VitestTestRunner = VitestTestRunner;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/test-runner/vitest-test-runner.js.map