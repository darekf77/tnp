import { UNIT_TEST_TIMEOUT } from '../../../../../../constants';

import { BaseTestRunner } from './base-test-runner';

export class VitestTestRunner extends BaseTestRunner {
  // CLI should only filter, NOT define extensions
  fileCommand(files: string[] = []): string {
    if (!files?.length) return '';
    return files.map(f => `"${f}"`).join(' ');
  }

  private buildCommand(
    files: string[],
    watch: boolean,
    debug: boolean,
  ): string {
    const vitestEntry = './node_modules/vitest/vitest.mjs';

    const filter = this.fileCommand(files);

    const mode = watch ? '' : 'run';

    const base =
      `${vitestEntry} ${mode} ${filter} ` +
      `--environment node ` +
      `--testTimeout ${UNIT_TEST_TIMEOUT}`;

    return debug ? `node --inspect-brk ${base}` : `node ${base}`;
  }

  async start(files: string[], debug: boolean) {
    //#region @backendFunc

    const command = this.buildCommand(files, false, debug);

    this.project.run(command, { output: true }).sync();

    //#endregion
  }

  async startAndWatch(files: string[], debug: boolean) {
    //#region @backendFunc

    const command = this.buildCommand(files, true, debug);

    this.project
      .run(command, {
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      .async();

    //#endregion
  }
}
