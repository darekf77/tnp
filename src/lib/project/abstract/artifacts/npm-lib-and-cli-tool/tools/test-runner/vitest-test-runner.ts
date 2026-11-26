import { spawn } from 'node:child_process'; // @backend
import { resolve } from 'node:path'; // @backend

import { BaseFeatureForProject } from 'tnp-helpers/src';

import { tmpSourceDist, UNIT_TEST_TIMEOUT } from '../../../../../../constants';
import { Project } from '../../../../../../project/abstract/project';

import { BaseTestRunner } from './base-test-runner';

type VitestTarget = 'backend' | 'browser';

// @ts-ignore TODO weird inheritance problem
export class VitestTestRunner extends BaseFeatureForProject<Project> {
  runVitest(target: VitestTarget): Promise<number> {
    //#region @backendFunc
    const cwd = this.project.location;
    const vitestPath = resolve(cwd, 'node_modules', 'vitest', 'vitest.mjs');

    return new Promise((resolveExitCode, reject) => {
      const child = spawn(
        process.execPath,
        [
          vitestPath,
          'run',
          '--environment',
          'node',
          '--testTimeout',
          '60000',
          '--config',
          `vitest.config-${target}.ts`,
        ],
        { cwd, stdio: 'inherit' },
      );

      child.once('error', reject);
      child.once('close', (code, signal) => {
        if (code === null) {
          reject(
            new Error(`Vitest terminated by ${signal ?? 'an unknown signal'}.`),
          );
          return;
        }

        resolveExitCode(code);
      });
    });
    //#endregion
  }
}
