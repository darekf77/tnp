"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JestTestRunner = void 0;
const lib_1 = require("tnp-helpers/lib");
const base_test_runner_1 = require("./base-test-runner");
class JestTestRunner extends base_test_runner_1.BaseTestRunner {
    fileCommand(files) {
        return this.getCommonFilePattern('src', files, ['.spec.ts']);
    }
    async start(files, debug) {
        let command;
        command = command = `npm-run jest --passWithNoTests`;
        command = lib_1.Helpers._fixCommand(command);
        this.project.run(command, { output: true }).sync();
    }
    async startAndWatch(files, debug) {
        let command = `npm-run jest --watchAll --passWithNoTests `;
        command = lib_1.Helpers._fixCommand(command);
        this.project
            .run(command, {
            stdio: ['pipe', 'pipe', 'pipe'],
        })
            .async();
    }
}
exports.JestTestRunner = JestTestRunner;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/test-runner/jest-test-runner.js.map