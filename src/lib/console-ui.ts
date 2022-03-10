// //#region @backend
// import { Project } from './project';
// import { prompt } from 'enquirer';
// import { _ } from 'tnp-core';
// import { fse } from 'tnp-core'
// import { path } from 'tnp-core'
// import { EnumValues } from 'enum-values'
// import { CommandInstance } from './tnp-db/entites';
// import { Helpers } from 'tnp-helpers';
// import { TnpDB } from './tnp-db/wrapper-db';
// import * as fuzzy from 'fuzzy'
// import * as inquirer from 'inquirer'
// import * as inquirerAutocomplete from 'inquirer-autocomplete-prompt'
// import { killAll } from './scripts/PROJECTS-DEVELOPMENT/DEVELOP.backend';
// inquirer.registerPrompt('autocomplete', inquirerAutocomplete)

// class Choice {
//   constructor(
//     public name: string,
//     // public key: string,
//     public value: string
//   ) {

//   }

//   // toLowerCase() {
//   //   return this.value.toLowerCase()
//   // }
// }

// const CHOICE = {
//   LAST_USED_COMMAND: 'Last used command',
//   BUILD_DIST_WATCH: 'build:dist:watch',
//   BUILD_APP_WATCH: 'build:app:watch',
//   INIT: 'init',
//   BUILD_DIST: 'build:dist',
//   BUILD_APP: 'build:app',
//   START_SERVER: 'start',
//   CLEAR: 'clear',
//   CLEAR_RECUSIVE_WITH_NODE_MODUELS: 'clear:all --recrusive',
//   KILL_ALL_ACTIVE_BUILD_INSTANES_FROM_CURRENT_WORKSPACE: 'killall',
//   KILL_ON_PORT: 'killonport',
//   HELP: 'help',
// }

// export class ConsoleUi {

//   private readonly lastCommandFileName = 'last-command.txt'
//   constructor(public project: Project, private db: TnpDB) {

//   }

//   lastCmd: CommandInstance;
//   get lastCommandAvailable(): Boolean {
//     this.lastCmd = await this.db.lastCommandFrom(this.project.location)
//     // console.log('this.lastCmd',this.lastCmd)
//     //await  this.db.commandsSet.
//     return !!this.lastCmd;
//   }



//   async init(functions: Function[]) {

//     // const choices = [
//     //   { value: 'valuies', name: 'dupa' },
//     //   { value: 'valuies2', name: 'dupa2' },
//     //   { value: 'valuies3', name: 'dupa3' }
//     // ]
//     const choices = Object.keys(CHOICE)
//       .map(key => {
//         return { name: key, value: CHOICE[key] }
//       })
//       .filter(({ name, value }) => {
//         if (!name) {
//           return false;
//         }
//         if (!this.lastCommandAvailable) {
//           if (value === CHOICE.LAST_USED_COMMAND) {
//             return false
//           }
//         }
//         return true;
//       })
//       .map((s) => {
//         const { value, name } = s;
//         if (value === CHOICE.LAST_USED_COMMAND) {
//           s.name = `${s.name}: ${this.lastCmd.shortCommandForLastCommand}`
//         }
//         return new Choice(s.name, s.value as any);
//       })




//       // .concat(functions
//       //   // .filter( f => !!f.name  )
//       //   .map(f => {
//       //     let name = f.name;
//       //     if (name.startsWith('$')) {
//       //       name = name.slice(1)
//       //     }
//       //     const value = f.name;
//       //     return new Choice(name, value);
//       //   })
//       //   .filter(f => {

//       //     let name = f.name;
//       //     if (name.startsWith('$')) {
//       //       name = name.slice(1)
//       //     }

//       //     return !!f.name && !CHOICE[f.name] && !CHOICE[name]
//       //   })
//       // )
//       .filter(f => !!f)


//     const source = function searchFood(answers, input) {
//       input = input || '';
//       return new Promise(function (resolve) {
//         var fuzzyResult = fuzzy.filter(input, choices.map(f => f.name));
//         resolve(
//           fuzzyResult.map(function (el) {
//             return { name: el.original, value: choices.find(c => c.name === el.original).value };
//           })
//         );
//       });
//     }


//     let res: { command: string } = await inquirer.prompt({
//       type: 'autocomplete',
//       name: 'command',
//       pageSize: 10,
//       source,
//       message: 'What you wanna do ? ',
//       choices
//     } as any) as any;

//     // console.log('res', res)

//     switch (res.command) {

//       case CHOICE.INIT:
//         await this.db.transaction.setCommand(`tnp ${res.command}`)
//         await (Project.Current as Project).filesStructure.init('');
//         process.exit(0)
//         break;

//       case CHOICE.BUILD_APP_WATCH:
//         await this.db.transaction.setCommand(`tnp ${res.command}`)
//         await (Project.Current as Project).buildProcess.startForAppFromArgs(false, true, 'dist', '')
//         break;

//       case CHOICE.BUILD_DIST_WATCH:
//         await this.db.transaction.setCommand(`tnp ${res.command}`)
//         await (Project.Current as Project).buildProcess.startForLibFromArgs(false, true, 'dist', '')
//         break;

//       case CHOICE.BUILD_APP:
//         await this.db.transaction.setCommand(`tnp ${res.command}`)
//         await (Project.Current as Project).buildProcess.startForAppFromArgs(false, false, 'dist', '')
//         break;

//       case CHOICE.BUILD_DIST:
//         await this.db.transaction.setCommand(`tnp ${res.command}`)
//         await (Project.Current as Project).buildProcess.startForLibFromArgs(false, false, 'dist', '')
//         break;

//       case CHOICE.LAST_USED_COMMAND:
//         await this.db.runCommand(!!this.lastCmd ?
//           this.lastCmd : new CommandInstance(undefined, this.project.location)
//         );
//         break;

//       case CHOICE.CLEAR:
//         await (Project.Current as Project).filesStructure.clearFromArgs('')
//         break;

//       case CHOICE.CLEAR_RECUSIVE_WITH_NODE_MODUELS:
//         // await (Project.Current as Project).
//         break;

//       case CHOICE.KILL_ALL_ACTIVE_BUILD_INSTANES_FROM_CURRENT_WORKSPACE:
//         killAll()
//         break;

//       case CHOICE.KILL_ON_PORT:
//         let num: { port: number } = await prompt({
//           type: 'numeral',
//           name: 'port',
//           message: 'Please port number'
//         }) as any;
//         await Helpers.killProcessByPort(num.port);
//         process.exit(0)
//         break;

//       // default:
//       //   const fn = functions.find(f => f.name === res.command);
//       //   if (_.isFunction(fn)) {
//       //     this.db.commands.setCommand(crossPlatformPath(process.cwd()), `tnp ${simplifiedCmd(fn.name)}`)
//       //     await runSyncOrAsync(fn)
//       //   } else {
//       //     throw `Command not implemented: ${res.command}`
//       //   }

//       //   break;
//     }

//   }

// }
// //#endregion