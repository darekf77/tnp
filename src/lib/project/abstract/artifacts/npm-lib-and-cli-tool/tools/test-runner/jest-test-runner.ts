import { _, crossPlatformPath } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';
import { Helpers } from 'tnp-helpers/src';

import { tempSourceFolder } from '../../../../../../constants';
import type { Project } from '../../../../project';

import { BaseTestRunner } from './base-test-runner';

export class JestTestRunner extends BaseTestRunner {
 fileCommand(files: string[]): string {
    return this.getCommonFilePattern('src', files, ['.spec.ts']);
  }

  async start(files: string[], debug: boolean) {
    let command: string;

    command = command = `npm-run jest --passWithNoTests`;
    command = Helpers._fixCommand(command);

    this.project.run(command, { output: true }).sync();
  }

  async startAndWatch(files: string[], debug: boolean) {
    let command = `npm-run jest --watchAll --passWithNoTests `;

    command = Helpers._fixCommand(command);

    this.project
      .run(command, {
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      .async();
  }
}
