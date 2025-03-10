import { spawn, ChildProcess } from 'child_process';

interface CommandConfig {
  name: string;
  cmd: string;
  /**
   * If true, the output will be stored in a buffer and displayed when requested.
   * Default: true
   */
  useDataBuffer?: boolean;
}

interface InitOptions {
  title: string;
  commands: CommandConfig[];
}

export class BuildProcessManager {
  public readonly processes: Record<string, ChildProcess> = {};
  private showLogs: boolean = true;
  private outputBuffer: Record<string, string[]> = {};
  private maxBufferSize: number = 500;
  private commands: CommandConfig[] = [];
  private title: string = '';

  init(options: InitOptions): void {
    //#region @backendFunc
    this.title = options.title;
    this.commands = options.commands;
    this.commands.forEach(cmd => {
      this.outputBuffer[cmd.name] = [];
      cmd.useDataBuffer = cmd.useDataBuffer ?? true;
    });
    this.buildMenu();
    //#endregion
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
    const selection: string[] = await new MultiSelect({
      message: this.title,
      choices: choices,
      result(names: string[]) {
        return names;
      },
    }).run();
    this.startProcesses(selection);
    //#endregion
  }

  private startProcesses(selection: string[]): void {
    //#region @backendFunc
    selection.forEach(proc => {
      if (!this.processes[proc]) {
        let command = this.commands.find(cmd => cmd.name === proc);
        if (!command) return;
        let child = spawn(command.cmd, {
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        child.stdout?.on('data', data => {
          let message = `[${this.getFormattedTimestamp()}] ${data.toString().trim()}`;
          if (command.useDataBuffer) {
            this.outputBuffer[proc].push(message);
            if (this.outputBuffer[proc].length > this.maxBufferSize)
              this.outputBuffer[proc].shift();
          }
          if (this.showLogs) console.log(message);
        });
        child.stderr?.on('data', data => {
          let message = `[${this.getFormattedTimestamp()}] ${data.toString().trim()}`;
          if (command.useDataBuffer) {
            this.outputBuffer[proc].push(message);
            if (this.outputBuffer[proc].length > this.maxBufferSize)
              this.outputBuffer[proc].shift();
          }
          if (this.showLogs) console.error(message);
        });

        child.on('exit', () => delete this.processes[proc]);
        this.processes[proc] = child;
      }
    });

    this.showOutput();
    //#endregion
  }

  private stopProcess(proc: string): void {
    //#region @backendFunc
    if (this.processes[proc]) {
      this.processes[proc].kill();
      delete this.processes[proc];
    }
    this.killOrBuildMenu();
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
      const exit = 'Exit';

      let options = [
        chooseAction,
        ...Object.keys(this.processes).map(proc => `Kill ${proc}`),
      ];

      if (Object.keys(this.processes).length < this.commands.length) {
        options.push(buildMore);
      }
      options.push(showOutput);
      options.push(exit);

      const action: string = await new Select({
        message: 'Manage Processes',
        choices: options,
      }).run();

      if (action === exit) {
        Object.values(this.processes).forEach(proc => proc.kill());
        process.exit(0);
      } else if (action.startsWith('Kill')) {
        this.stopProcess(action.split(' ')[1]);
      } else if (action === buildMore) {
        this.buildMenu();
      } else if (action === showOutput) {
        this.showOutput();
      }
      if (action !== chooseAction) {
        break;
      }
    }
    //#endregion
  }
}
