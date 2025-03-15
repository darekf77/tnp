import { BuildProcessManager } from '../tmp-source-dist/lib/project/abstract/artifacts/build-process-manager';

const processManager = new BuildProcessManager();
processManager.init({
  title: 'What do you want to build?',
  header: 'Starting process selection...',
  watch: true,
  commands: [
    {
      name: 'TSC',
      cmd: 'node -e "let i = 0; setInterval(() => console.log(\'Compiled success \' + (++i)), 1000)"',
      goToNextCommandWhen: { stdoutContains: 'Compiled success 8' },
    },
    {
      name: 'NG1',
      cmd: 'node -e "let i = 0; setInterval(() => console.log(\'NG1: Hello from ng --watch \' + (++i)), 1200)"',
      // goToNextCommandWhen: { stdoutContains: 'NG1: Hello from ng --watch 5' },
    },
    {
      name: 'NG2',
      cmd: 'node -e "let i = 0; setInterval(() => console.log(\'NG2: Hello from ng --watch \' + (++i)), 1500)"',
    },
  ],
});
process.on('SIGINT', () => {
  Object.values(processManager.processes).forEach(proc => proc.kill());
  process.exit(0);
});
