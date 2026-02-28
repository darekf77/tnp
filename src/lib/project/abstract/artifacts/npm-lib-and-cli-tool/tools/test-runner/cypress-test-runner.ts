import { config, LibTypeEnum } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';
import { Helpers } from 'tnp-helpers/src';

import { UNIT_TEST_TIMEOUT } from '../../../../../../constants';
import type { Project } from '../../../../project';

import { BaseTestRunner } from './base-test-runner';

export class CypressTestRunner extends BaseTestRunner {
  fileCommand(files: string[]): string {
    return this.getCommonFilePattern('e2e', files, ['.e2e.ts', '.e2e.tsx']);
  }

  async start(files?: string[], debug = false) {
    let command: string;

    command = command =
      `npm-run mocha  ${debug ? '--inspect' : ''} --require ts-node/register ${this.fileCommand(files)} ` +
      ` --timeout ${UNIT_TEST_TIMEOUT} `;

    this.project.run(command, { output: true }).sync();
  }

  async startAndWatch(files?: string[], debug = false) {
    if (this.project.typeIsNot(LibTypeEnum.ISOMORPHIC_LIB)) {
      Helpers.error(
        `Tests not impolemented for ${this.project.type}`,
        false,
        true,
      );
    }

    let command =
      `npm-run mocha  ${debug ? '--inspect' : ''} --require ts-node/register ${this.fileCommand(files)} ` +
      `--watch --watch-files src/tests/**/* --timeout ${UNIT_TEST_TIMEOUT} `;

    command = Helpers._fixCommand(command);
    Helpers.run(command, {
      stdio: ['pipe', 'pipe', 'pipe'],
      // env: { ...process.env, FORCE_COLOR: '1' },
      cwd: this.project.location,
    }).async();
  }
}

function remoteAtFromCallStack(s) {
  // let oneExPass = false;
  return s
    .split('\n')
    .map(l => {
      // if (l.trim().startsWith('at ')) { // TODO hmmm i think I don't need this.. long call stack ok when no fail
      //   if (oneExPass) {
      //     return void 0;
      //   } else {
      //     oneExPass = true;
      //   }
      // }
      return l;
    })
    .filter(l => !_.isUndefined(l))
    .join('\n')
    .trim();
}
