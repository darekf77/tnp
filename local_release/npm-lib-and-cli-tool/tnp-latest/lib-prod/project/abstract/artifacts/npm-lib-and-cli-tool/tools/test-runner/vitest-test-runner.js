import { tmpSourceDist, UNIT_TEST_TIMEOUT, } from '../../../../../../constants';
import { BaseTestRunner } from './base-test-runner';
export class VitestTestRunner extends BaseTestRunner {
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
            `--testTimeout ${UNIT_TEST_TIMEOUT}`;
        return debug ? `node --inspect-brk ${base}` : `node ${base}`;
    }
    async start(files, debug) {
        //#region @backendFunc
        const command = this.buildCommand(files, false, debug);
        await this.run(tmpSourceDist, command);
        //#endregion
    }
    async startAndWatch(files, debug) {
        //#region @backendFunc
        const command = this.buildCommand(files, true, debug);
        await this.run(tmpSourceDist, command);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/test-runner/vitest-test-runner.js.map