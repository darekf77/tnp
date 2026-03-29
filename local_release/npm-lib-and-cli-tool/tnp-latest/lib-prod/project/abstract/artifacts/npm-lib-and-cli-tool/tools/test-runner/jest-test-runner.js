import { Helpers__NS___fixCommand } from 'tnp-helpers/lib-prod';
import { BaseTestRunner } from './base-test-runner';
export class JestTestRunner extends BaseTestRunner {
    fileCommand(files) {
        return this.getCommonFilePattern('src', files, ['.spec.ts']);
    }
    async start(files, debug) {
        let command;
        command = command = `npm-run jest --passWithNoTests`;
        command = Helpers__NS___fixCommand(command);
        this.project.run(command, { output: true }).sync();
    }
    async startAndWatch(files, debug) {
        let command = `npm-run jest --watchAll --passWithNoTests `;
        command = Helpers__NS___fixCommand(command);
        this.project
            .run(command, {
            stdio: ['pipe', 'pipe', 'pipe'],
        })
            .async();
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/test-runner/jest-test-runner.js.map