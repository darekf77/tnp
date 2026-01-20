// //#region imports
// import * as os from 'os'; // @backend

// import { AsyncPipe, CommonModule, JsonPipe, NgFor } from '@angular/common'; // @browser
// import {
//   NgModule,
//   inject,
//   Injectable,
//   APP_INITIALIZER,
//   ApplicationConfig,
//   provideBrowserGlobalErrorListeners,
//   isDevMode,
//   mergeApplicationConfig,
// } from '@angular/core'; // @browser
// import { Component, OnInit } from '@angular/core'; // @browser
// import { VERSION } from '@angular/core'; // @browser
// import {
//   provideClientHydration,
//   withEventReplay,
// } from '@angular/platform-browser';
// import { provideRouter, RouterOutlet, Routes } from '@angular/router';
// import { provideServiceWorker } from '@angular/service-worker';
// import { provideServerRendering, withRoutes } from '@angular/ssr';
// import { RenderMode, ServerRoute } from '@angular/ssr';
// import Aura from '@primeng/themes/aura'; // @browser
// import { MaterialCssVarsModule } from 'angular-material-css-vars'; // @browser
// // import { providePrimeNG } from 'primeng/config'; // @browser
// import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
// import {
//   Taon,
//   TaonBaseContext,
//   TAON_CONTEXT,
//   EndpointContext,
//   TaonBaseAngularService,
//   TaonEntity,
//   StringColumn,
//   TaonBaseAbstractEntity,
//   TaonBaseCrudController,
//   TaonController,
//   GET,
//   TaonMigration,
//   TaonBaseMigration,
// } from 'taon/src';
// import { Utils, UtilsOs } from 'tnp-core/src';

// import { HOST_CONFIG } from './app.hosts';

// //#endregion

// console.log('hello world');
// console.log('Your backend host ' + HOST_CONFIG['MainContext'].host);
// console.log('Your frontend host ' + HOST_CONFIG['MainContext'].frontendHost);

// //#region tnp component

// //#region @browser
// @Component({
//   selector: 'app-root',

//   imports: [
//     RouterOutlet,
//     AsyncPipe,
//     NgFor,
//     JsonPipe,
//     // MaterialCssVarsModule.forRoot({
//     //   // inited angular material - remove if not needed
//     //   primary: '#4758b8',
//     //   accent: '#fedfdd',
//     // }),
//   ],
//   template: `hello from tnp<br />
//     Angular version: {{ angularVersion }}<br />
//     <br />
//     users from backend
//     <ul>
//       <li *ngFor="let user of users$ | async">{{ user | json }}</li>
//     </ul>
//     hello world from backend: <strong>{{ hello$ | async }}</strong>
//     <br />
//     <button (click)="addUser()">Add new example user with random name</button>`,
//   styles: [
//     `
//       body {
//         margin: 0px !important;
//       }
//     `,
//   ],
// })
// export class TnpApp {
//   angularVersion =
//     VERSION.full +
//     ` mode: ${UtilsOs.isRunningInWebSQL() ? ' (websql)' : '(normal)'}`;

//   userApiService = inject(UserApiService);

//   private refresh = new BehaviorSubject<void>(undefined);

//   readonly users$: Observable<User[]> = this.refresh.pipe(
//     switchMap(() =>
//       this.userApiService.userController
//         .getAll()
//         .request()
//         .observable.pipe(map(r => r.body.json)),
//     ),
//   );

//   readonly hello$ = this.userApiService.userController
//     .helloWorld()
//     .request()
//     .observable.pipe(map(r => r.body.text));

//   async addUser(): Promise<void> {
//     const newUser = new User();
//     newUser.name = `user-${Math.floor(Math.random() * 1000)}`;
//     await this.userApiService.userController.save(newUser).request();
//     this.refresh.next();
//   }
// }
// //#endregion

// //#endregion

// //#region  tnp api service

// //#region @browser
// @Injectable({
//   providedIn: 'root',
// })
// export class UserApiService extends TaonBaseAngularService {
//   userController = this.injectController(UserController);

//   getAll(): Observable<User[]> {
//     return this.userController
//       .getAll()
//       .request()
//       .observable.pipe(map(r => r.body.json));
//   }
// }
// //#endregion

// //#endregion

// //#region  tnp routes
// //#region @browser
// export const TnpServerRoutes: ServerRoute[] = [
//   {
//     path: '**',
//     renderMode: RenderMode.Prerender,
//   },
// ];
// export const TnpClientRoutes: Routes = [];
// //#endregion
// //#endregion

// //#region  tnp app configs
// //#region @browser
// export const TnpAppConfig: ApplicationConfig = {
//   providers: [
//     {
//       provide: TAON_CONTEXT,
//       useFactory: () => MainContext,
//     },
//     // providePrimeNG({
//     //   // inited ng prime - remove if not needed
//     //   theme: {
//     //     preset: Aura,
//     //   },
//     // }),
//     {
//       provide: APP_INITIALIZER,
//       multi: true,
//       useFactory: () => TnpStartFunction,
//     },
//     provideBrowserGlobalErrorListeners(),
//     provideRouter(TnpClientRoutes),
//     provideClientHydration(withEventReplay()),
//     provideServiceWorker('ngsw-worker.js', {
//       enabled: !isDevMode(),
//       registrationStrategy: 'registerWhenStable:30000',
//     }),
//   ],
// };

// export const TnpServerConfig: ApplicationConfig = {
//   providers: [provideServerRendering(withRoutes(TnpServerRoutes))],
// };

// export const TnpConfig = mergeApplicationConfig(TnpAppConfig, TnpServerConfig);
// //#endregion
// //#endregion

// //#region  tnp entity
// @TaonEntity({ className: 'User' })
// class User extends TaonBaseAbstractEntity {
//   //#region @websql
//   @StringColumn()
//   //#endregion
//   name?: string;

//   getHello(): string {
//     return `hello ${this.name}`;
//   }
// }
// //#endregion

// //#region  tnp controller
// @TaonController({ className: 'UserController' })
// class UserController extends TaonBaseCrudController<User> {
//   // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
//   entityClassResolveFn = () => User;

//   @GET()
//   helloWorld(): Taon.Response<string> {
//     //#region @websqlFunc
//     return async (req, res) => 'hello world';
//     //#endregion
//   }

//   @GET()
//   getOsPlatform(): Taon.Response<string> {
//     //#region @websqlFunc
//     return async (req, res) => {
//       //#region @backend
//       return os.platform(); // for normal nodejs backend return real value
//       //#endregion

//       return 'no-platform-inside-browser-and-websql-mode';
//     };
//     //#endregion
//   }
// }
// //#endregion

// //#region  tnp migration

// //#region @websql
// @TaonMigration({
//   className: 'UserMigration',
// })
// class UserMigration extends TaonBaseMigration {
//   userController = this.injectRepo(User);

//   async up(): Promise<any> {
//     const superAdmin = new User();
//     superAdmin.name = 'super-admin';
//     await this.userController.save(superAdmin);
//   }
// }
// //#endregion

// //#endregion

// //#region  tnp context
// var MainContext = Taon.createContext(() => ({
//   ...HOST_CONFIG['MainContext'],
//   contexts: { TaonBaseContext },

//   //#region @websql
//   /**
//    * This is dummy migration - you DO NOT NEED need this migrations object
//    * if you are using HOST_CONFIG['MainContext'] that contains 'migrations' object.
//    * DELETE THIS 'migrations' object if you use taon CLI that generates
//    * migrations automatically inside /src/migrations folder.
//    */
//   migrations: {
//     UserMigration,
//   },
//   //#endregion

//   controllers: {
//     UserController,
//   },
//   entities: {
//     User,
//   },
//   database: true,
//   // disabledRealtime: true,
// }));
// //#endregion

// //#region  tnp start function
// const TnpStartFunction = async (
//   startParams?: Taon.StartParams,
// ): Promise<void> => {
//   await MainContext.initialize();

//   //#region @backend
//   if (
//     startParams?.onlyMigrationRun ||
//     startParams?.onlyMigrationRevertToTimestamp
//   ) {
//     process.exit(0);
//   }
//   //#endregion

//   //#region @backend
//   console.log(`Hello in NodeJs backend! os=${os.platform()}`);
//   //#endregion

//   if (UtilsOs.isBrowser) {
//     let users = (
//       await MainContext.getClassInstance(UserController).getAll().request()
//     ).body?.json;

//     if (UtilsOs.isElectron) {
//       // TODO QUICK_FIX (ng2-rest refactor for ipc needed)
//       users = users.map(u => new User().clone(u));
//     }

//     for (const user of users || []) {
//       console.log(`user: ${user.name} - ${user.getHello()}`);
//     }
//   }
// };
// //#endregion

// export default TnpStartFunction;
