import { BuildProcessManager } from '../src/lib/project/abstract/artifacts/build-process-maanger';

const processManager = new BuildProcessManager();
processManager.init({
  title: 'What do you want to build?',
  commands: [
    {
      name: 'TSC',
      cmd: 'node -e "setInterval(() => console.log(\'TSC: Hello from tsc -w\'), 1000)"',
    },
    {
      name: 'NG1',
      cmd: 'node -e "setInterval(() => console.log(\'NG1: Hello from ng --watch\'), 1200)"',
    },
    {
      name: 'NG2',
      cmd: 'node -e "setInterval(() => console.log(\'NG2: Hello from ng --watch\'), 1500)"',
    },
  ],
});

process.on('SIGINT', () => {
  Object.values(processManager.processes).forEach(proc => proc.kill());
  process.exit(0);
});
