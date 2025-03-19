import { spawn, ChildProcess, exec, execSync } from 'child_process';

import { chalk, UtilsProcess } from 'tnp-core/src';
import { UtilsTerminal } from 'tnp-core/src';
import { Helpers } from 'tnp-core/src';

interface CommandConfig {
  name: string;
  cmd: string;
  /**
   * If true, the output will be stored in a buffer and displayed when requested.
   * Default: true
   */
  useDataBuffer?: boolean;
  /**
   * Name of process that should be started
   * before this process starts.
   *
   */ // TODO @LAST add queue of processes
  dependencyProcessesNames?: string[];
  goToNextCommandWhen?: {
    stdoutContains?: string | string[];
    stderrContains?: string | string[];
  };
}

interface InitOptions {
  title: string;
  header?: string;
  commands: CommandConfig[];
  watch?: boolean;
}

export class BuildProcessManager {
  /**
   * Current selected for running processes
   */
  public readonly processes: Record<string, ChildProcess> = {};
  public currentSelectedProcesses: string[] = [];
  public queuedProcesses: Record<string, boolean> = {};
  private showLogs: boolean = true;
  private outputBuffer: Record<string, string[]> = {};
  private maxBufferSize: number = 500;
  private commands: CommandConfig[] = [];
  private title: string = '';
  private header: string = '';
  private watch: boolean = true;

  init(options: InitOptions): Promise<void> {
    //#region @backendFunc
    return new Promise(async (resolve, reject) => {
      this.watch = options.watch ?? true;
      this.header = options.header ?? '';
      this.title = options.title;
      this.commands = options.commands;
      this.commands.forEach(cmd => {
        this.outputBuffer[cmd.name] = [];
        cmd.useDataBuffer = cmd.useDataBuffer ?? true;
      });
      if (this.watch) {
        this.buildMenu();
      } else {
        await this.buildMenu();
        resolve();
      }
    });
    //#endregion
  }

  private shouldMoveToNext(
    condition: string | string[] | undefined,
    message: string,
  ): boolean {
    if (!condition) return false;
    if (Array.isArray(condition)) {
      return condition.some(str => message.includes(str));
    }
    return message.includes(condition);
  }

  private getFormattedTimestamp(): string {
    return new Date().toISOString();
  }

  private async buildMenu(): Promise<void> {
    //#region @backendFunc
    console.clear();
    const choices = this.commands
      .map(cmd => cmd.name)
      .filter(proc => !this.processes[proc]);
    if (choices.length === 0) {
      console.log('All processes are already running. Returning to menu.');
      setTimeout(() => this.killOrBuildMenu(), 1000);
      return;
    }
    const { MultiSelect, Select } = require('enquirer');
    if (this.header) {
      console.log(this.header);
    }
    const selection: string[] = await new MultiSelect({
      message: this.title,
      choices: choices,
      result(names: string[]) {
        return names;
      },
    }).run();
    this.currentSelectedProcesses = selection;
    this.startProcesses(selection);
    //#endregion
  }

  private async startProcess(
    commandConfig: CommandConfig,
    cmdIndex: number,
  ): Promise<void> {
    const procName: string = commandConfig.name;
    if (this.processes[procName]) {
      return;
    }
    let command = this.commands.find(cmd => cmd.name === procName);
    if (!command) return;
    const env = { ...process.env, FORCE_COLOR: '1' };

    let child = spawn(command.cmd, {
      shell: true,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let resolved = false;

    const nextCommandWhenResolved = commandConfig.goToNextCommandWhen
      ? () => {
          const nextCmd = this.commands.find(
            (cmd, index) => index === cmdIndex + 1,
          );
          if (!nextCmd) {
            return;
          }
          const nextCmdIndex = this.commands.findIndex(
            cmd => nextCmd.name === cmd.name,
          );
          if (!this.currentSelectedProcesses.includes(nextCmd.name)) {
            return;
          }
          this.queuedProcesses[nextCmd.name] = false;
          this.startProcess(nextCmd, nextCmdIndex);
        }
      : undefined;

    child.stdout?.on('data', data => {
      let message = `${data.toString().trim()}`;
      if (command.useDataBuffer) {
        this.outputBuffer[procName].push(message);
        if (this.outputBuffer[procName].length > this.maxBufferSize)
          this.outputBuffer[procName].shift();
      }
      if (this.showLogs) {
        console.log(message);
      }
      if (
        !resolved &&
        !!nextCommandWhenResolved &&
        this.shouldMoveToNext(
          command.goToNextCommandWhen?.stdoutContains,
          message,
        )
      ) {
        resolved = true;
        nextCommandWhenResolved();
      }
    });
    child.stderr?.on('data', data => {
      let message = `[${this.getFormattedTimestamp()}] ${data.toString().trim()}`;
      if (command.useDataBuffer) {
        this.outputBuffer[procName].push(message);
        if (this.outputBuffer[procName].length > this.maxBufferSize)
          this.outputBuffer[procName].shift();
      }
      if (this.showLogs) {
        console.error(message);
      }
      if (
        !resolved &&
        !!nextCommandWhenResolved &&
        this.shouldMoveToNext(
          command.goToNextCommandWhen?.stderrContains,
          message,
        )
      ) {
        resolved = true;
        nextCommandWhenResolved();
      }
    });

    child.on('exit', () => {
      delete this.processes[procName];
      delete this.queuedProcesses[procName];
    });

    this.processes[procName] = child;
    // if (nextCommandWhenResolved) {
    //   resolve();
    // }
  }

  private async startProcesses(selection: string[]): Promise<void> {
    //#region @backendFunc
    if (this.watch) {
      if (selection.length === 0) {
        return this.showOutput();
      }

      const previousIsSequentialNames: string[] = [];

      this.commands.forEach((cmd, index) => {
        if (cmd.goToNextCommandWhen) {
          const nextCmdConfig = this.commands[index + 1];
          if (nextCmdConfig) {
            previousIsSequentialNames.push(nextCmdConfig.name);
            this.queuedProcesses[nextCmdConfig.name] = true;
          }
        }
      });

      selection.forEach((procName, index) => {
        if (previousIsSequentialNames.includes(procName)) {
          return;
        }
        const cmd = this.commands.find(cmd => cmd.name === procName);
        this.startProcess(cmd, index);
      });

      this.showOutput();
    } else {
      const commands = selection.map(
        proc => this.commands.find(cmd => cmd.name === proc)?.cmd,
      );

      for (let index = 0; index < commands.length; index++) {
        const command = commands[index];

        Helpers.info(`

          Running (${index + 1}/${commands.length}) command:

    ${chalk.gray(command)}

        `);
        while (true) {
          try {
            Helpers.run(command, { output: true, silence: false }).sync();
            break;
          } catch (error) {
            const options = {
              retry: {
                name: 'Retry command',
              },
              exit: {
                name: 'Exit',
              },
              skip: {
                name: 'Skip command',
              },
            };

            const res = await UtilsTerminal.select<keyof typeof options>({
              question: `Error while running command. What would you like to do?`,
              choices: options,
            });
            if (res === 'exit') {
              process.exit(1);
            }
            if (res === 'skip') {
              break;
            }
          }
        }
      }
    }

    //#endregion
  }

  private stopProcess(procName: string): void {
    //#region @backendFunc
    if (this.queuedProcesses[procName]) {
      this.queuedProcesses[procName] = false;
    }
    if (this.processes[procName]) {
      const pid = this.processes[procName].pid;
      try {
        if (pid) {
          if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /T /F`);
            delete this.processes[procName];
            this.killOrBuildMenu();
          } else {
            process.kill(-pid);
            delete this.processes[procName];
            this.killOrBuildMenu();
          }
        }
      } catch (error) {
        console.error(`Error killing process ${procName}: ${error.message}`);
        setTimeout(() => this.killOrBuildMenu(), 3000);
      }
    } else {
      console.error(`NOT FOUND "${procName}"`);
      setTimeout(() => this.killOrBuildMenu(), 3000);
    }
    //#endregion
  }

  private showOutput(): void {
    //#region @backendFunc
    console.clear();
    this.showLogs = true;
    console.log('Displaying output... Press Enter to stop.');
    Object.keys(this.outputBuffer).forEach(proc => {
      console.log(this.outputBuffer[proc].join('\n'));
    });
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      this.showLogs = false;
      this.killOrBuildMenu();
    });
    //#endregion
  }

  private async killOrBuildMenu(): Promise<void> {
    //#region @backendFunc
    const chooseAction = ' -- choose action -- ';
    const { Select } = require('enquirer');

    while (true) {
      console.clear();
      this.showLogs = false;
      const showOutput = 'Show output';
      const buildMore = 'Build more';
      const kill = chalk.bold('Kill');
      // const exit = 'Exit';

      if (Object.keys(this.processes).length === this.commands.length) {
        this.queuedProcesses = {};
      }

      let optionsToSchedule = Object.keys(this.queuedProcesses)
        .map(procName => {
          if (
            this.queuedProcesses[procName] === true &&
            this.currentSelectedProcesses.includes(procName)
          ) {
            return `${chalk.bold('Scheduled to start')}: ${procName.trim()}`;
          }
        })
        .filter(f => !!f);

      let optionsToKill = [
        chooseAction,
        ...Object.keys(this.processes).map(proc => `${kill}: ${proc.trim()}`),
        ...optionsToSchedule,
      ];

      if (Object.keys(this.processes).length < this.commands.length) {
        optionsToKill.push(buildMore);
      }
      optionsToKill.push(showOutput);
      // options.push(exit);

      console.clear();
      Helpers.info(`

        Manage Processes (${chalk.bold('ctrl + c')} to exit)

        `);

      const action: string = await new Select({
        message: `Select action`,
        choices: optionsToKill,
      }).run();

      // if (action === exit) {
      //   Object.values(this.processes).forEach(proc => proc.kill());
      //   process.exit(0);
      // } else
      if (action.startsWith(kill)) {
        const procName = action.split(':')[1].trim();
        return this.stopProcess(procName);
      } else if (action === buildMore) {
        return this.buildMenu();
      } else if (action === showOutput) {
        return this.showOutput();
      }
    }
    //#endregion
  }

  getProceInfo() {
    //     const proc = await UtilsProcess.getCurrentProcessAndChildUsage();
    //     Cpu current proc: ${proc.current.cpu}/100%
    //     Mem usage: ${proc.current.memoryInMB} MB
    //     Child processes:
    // ${proc.children.map(c => `- pid ${c.pid}, cpu: ${c.cpu}, mem: ${c.memoryInMB} MB`).join('\n')}
  }
}

// process.on('SIGINT', () => {
//   Object.values(processManager.processes).forEach(proc => {
//     if (proc.pid) {
//       if (process.platform === 'win32') {
//         exec(`taskkill /PID ${proc.pid} /F`);
//       } else {
//         process.kill(-proc.pid);
//       }
//     }
//   });
//   process.exit(0);
// });
