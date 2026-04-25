# Taon Worker/Microservice

How to start worker/service


```ts
// your app app/cli

function async startWorker() {
  const worker = new DevModeWorker(
    'unique-for-the-whole-os-id-for-service',
    'command for starting this service. ex: dev-mode-cli startWorker'
  );
  const ctrl = await worker.cliStartProcedure(); // by default started as child_process
  //
}

```