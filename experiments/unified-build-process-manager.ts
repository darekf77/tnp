import { ChildProcess } from 'child_process';

const { spawn } = require('child_process');
const { MultiSelect, Select } = require('enquirer');

let processes = {};
let showLogs = true;
let outputBuffer: any[] = [];
const MAX_BUFFER_SIZE = 100;

function getFormattedTimestamp() {
  return new Date().toISOString();
}

async function buildMenu() {
  console.clear();
  const choices = ['TSC', 'NG1', 'NG2'].filter(proc => !processes[proc]);
  if (choices.length === 0) {
    console.log('All processes are already running. Returning to menu.');
    setTimeout(killOrBuildMenu, 1000);
    return;
  }
  const selection = await new MultiSelect({
    message: 'What do you want to build?',
    choices: choices,
    result(names) {
      return names;
    },
  }).run();
  startProcesses(selection);
}

function startProcesses(selection) {
  let processCommands = {
    TSC: [
      'node',
      [
        '-e',
        'setInterval(() => console.log(`[${new Date().toISOString()}] TSC: Hello from tsc -w`), 1000)',
      ],
    ],
    NG1: [
      'node',
      [
        '-e',
        'setInterval(() => console.log(`[${new Date().toISOString()}] NG1: Hello from ng --watch`), 1200)',
      ],
    ],
    NG2: [
      'node',
      [
        '-e',
        'setInterval(() => console.log(`[${new Date().toISOString()}] NG2: Hello from ng --watch`), 1500)',
      ],
    ],
  };

  selection.forEach(proc => {
    if (!processes[proc]) {
      let [cmd, args] = processCommands[proc];
      let child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });

      child.stdout.on('data', data => {
        let message = `[${getFormattedTimestamp()}] ${data.toString().trim()}`;
        outputBuffer.push(message);
        if (outputBuffer.length > MAX_BUFFER_SIZE) outputBuffer.shift();
        if (showLogs) console.log(message);
      });
      child.stderr.on('data', data => {
        let message = `[${getFormattedTimestamp()}] ${data.toString().trim()}`;
        outputBuffer.push(message);
        if (outputBuffer.length > MAX_BUFFER_SIZE) outputBuffer.shift();
        if (showLogs) console.error(message);
      });

      child.on('exit', () => delete processes[proc]);
      processes[proc] = child;
    }
  });

  showOutput();
}

function stopProcess(proc) {
  if (processes[proc]) {
    processes[proc].kill();
    delete processes[proc];
  }
  killOrBuildMenu();
}

function showOutput() {
  console.clear();
  showLogs = true;
  console.log('Displaying output... Press Enter to stop.');
  console.log(outputBuffer.join('\n'));
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.once('data', () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    showLogs = false;
    killOrBuildMenu();
  });
}

async function killOrBuildMenu() {
  console.clear();
  showLogs = false;
  let options = Object.keys(processes).map(proc => `Kill ${proc}`);
  if (Object.keys(processes).length < 3) options.push('Build more');
  options.push('Show output');

  const action = await new Select({
    message: 'Manage Processes',
    choices: options,
  }).run();

  if (action.startsWith('Kill')) {
    stopProcess(action.split(' ')[1]);
  } else if (action === 'Build more') {
    buildMenu();
  } else {
    showOutput();
  }
}

buildMenu();

process.on('SIGINT', () => {
  (Object.values(processes) as ChildProcess[]).forEach(proc => proc.kill());
  process.exit(0);
});
