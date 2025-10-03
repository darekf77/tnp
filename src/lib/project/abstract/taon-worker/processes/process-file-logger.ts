import { ChildProcess } from 'child_process';
import * as crypto from 'crypto';
import type * as fs from 'fs';
import { homedir } from 'os';

import { path, fse, UtilsOs, crossPlatformPath } from 'tnp-core/src';

// TODO @LAST move this to utils
export class ProcessFileLogger {
  private static baseDir = crossPlatformPath([
    UtilsOs.getRealHomeDir(),
    '.taon',
    'log-files-for',
    'deployments',
  ]);
  private processName: string;
  private logFilePath: string | null = null;
  private writeStream: fs.WriteStream | null = null;

  constructor(processName: string) {
    this.processName = processName;
    fse.mkdirSync(ProcessFileLogger.baseDir, { recursive: true });
  }

  startLogging(proc: ChildProcess): void {
    //#region @backendFunc
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const hash = crypto.randomBytes(4).toString('hex');
    const filename = `${this.processName}_${timestamp}_${hash}.log`;
    this.logFilePath = crossPlatformPath([ProcessFileLogger.baseDir, filename]);

    this.writeStream = fse.createWriteStream(this.logFilePath, { flags: 'a' });

    const update = (data: Buffer | string, type: 'stdout' | 'stderr') => {
      if (!this.writeStream) return;
      this.writeStream.write(
        `[${new Date().toISOString()}] [${type}] ${data.toString()}`,
      );
    };

    proc.stdout?.on('data', d => update(d, 'stdout'));
    proc.stderr?.on('data', d => update(d, 'stderr'));

    // prevent leaks
    proc.on('close', () => this.stopLogging());
    proc.on('exit', () => this.stopLogging());
    proc.on('error', () => this.stopLogging());
    //#endregion
  }

  stopLogging(): void {
    //#region @backendFunc
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
    }
    //#endregion
  }

  update(stdout: string, stderr?: string): void {
    //#region @backendFunc
    if (!this.writeStream) return;
    if (stdout)
      this.writeStream.write(
        `[${new Date().toISOString()}] [stdout] ${stdout}\n`,
      );
    if (stderr)
      this.writeStream.write(
        `[${new Date().toISOString()}] [stderr] ${stderr}\n`,
      );
    //#endregion
  }

  static getLogsFiles(processName: string): string[] {
    //#region @backendFunc
    if (!fse.existsSync(ProcessFileLogger.baseDir)) return [];
    const files = fse.readdirSync(ProcessFileLogger.baseDir);
    return files
      .filter(f => f.startsWith(processName + '_') && f.endsWith('.log'))
      .map(f => crossPlatformPath([ProcessFileLogger.baseDir, f]));
    //#endregion
  }
}
