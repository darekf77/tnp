import { LibTypeEnum } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__error, Helpers__NS__run } from 'tnp-helpers/lib-prod';
import { UNIT_TEST_TIMEOUT } from '../../../../../../constants';
import { BaseTestRunner } from './base-test-runner';
export class MochaTestRunner extends BaseTestRunner {
    fileCommand(files) {
        return this.getCommonFilePattern('src/tests', files, ['.test.ts']);
    }
    async start(files, debug = false) {
        let command;
        command = command =
            `npm-run mocha  ${debug ? '--inspect' : ''} --require ts-node/register ${this.fileCommand(files)} ` +
                ` --timeout ${UNIT_TEST_TIMEOUT} `;
        this.project.run(command, { output: true }).sync();
    }
    async startAndWatch(files, debug = false) {
        //#region @backendFunc
        if (this.project.typeIsNot(LibTypeEnum.ISOMORPHIC_LIB)) {
            Helpers__NS__error(`Tests not impolemented for ${this.project.type}`, false, true);
        }
        let command = `npm-run mocha  ${debug ? '--inspect' : ''} --require ts-node/register ${this.fileCommand(files)} ` +
            `--watch --watch-files src/tests/**/* --timeout ${UNIT_TEST_TIMEOUT} `;
        command = Helpers__NS___fixCommand(command);
        Helpers__NS__run(command, {
            stdio: ['pipe', 'pipe', 'pipe'],
            // env: { ...process.env, FORCE_COLOR: '1' },
            cwd: this.project.location,
        }).async();
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/test-runner/mocha-test-runner.js.map