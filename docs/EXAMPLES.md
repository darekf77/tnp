**Isomorphic code in TypeScript offers a range of advantages for full-stack developers.** 

By enabling code reuse on both the client and server sides, it enhances efficiency and ensures consistency.

## 1. No separation between backend and frontend code 
- Use backend entities as frontend DTOs!
- This is a dream situation for many developers!
- A perfect solution for all types of projects (hobbyists, freelancers, enterprises).
- **CRAZY FAST** business changes across database tables and frontend Angular templates — CHECK!
- Frontend, backend, and database code refactored simultaneously!

<b>user.entity.ts</b>
```ts
import { Taon } from 'taon';

@Taon.Entity()
class User extends Taon.Entity {
  //#region @backend
  @Taon.Orm.Column.Generated()
  //#endregion
  id: string;
}

```

your browser will get code below:
```ts
import { Taon } from 'taon/browser';

@Taon.Entity()
class User extends Taon.Entity {
  /* */
  /* */
  /* */
  id: string;
}

```

*..same thing applies in reverse to browser code*

<b>common.service.ts</b>

```ts
import { Taon } from 'taon';
//@region @browser
import { Injectable } from '@angular/core';
//#endregion

//@region @browser
@Injectable()
//#endregion 
class CommonService { 
  helloWorld() { 
    console.log('Hello on backend and frontend')
  }
}

```

your backend will get code below:
```ts
import { Taon } from 'taon';
/* */
/* */
/* */

/* */
/* */
/* */
class CommonService {
  helloWorld() { 
    console.log('Hello on backend and frontend')
  }
}
```

## 2. Websql Mode for writing backend in browser!
- Instead of running a local server, run everything (db, backend) in the browser thanks to sql.js/typeorm!
- This is possible ONLY in Taon, with the highest possible abstraction concepts.

<b>user.entity.ts</b>

```ts
import { Taon } from 'taon';

@Taon.Entity()
class User {
  //#region @websql
  @Taon.Orm.Column.Generated()
  //#endregion
  id: string;
}
```

your browser in WEBSQL mode will get code below:
```ts
import { Taon } from 'taon/websql';

@Taon.Entity()
class User {
 //#region @websql
  @Taon.Orm.Column.Generated()
  //#endregion
  id: string;
}
```

your browser in NORMAL NodeJS mode will get code below:
```ts
import { Taon } from 'taon/websql';

@Taon.Entity()
class User {
  /* */
  /* */
  /* */
  id: string;
}
```
Database columns can be created in browser/frontend with sql.js !

## 3. Create BE/FE CRUD REST API in a blink of the eye...
- Define the host only once for both backend and frontend!

- No more ugly access to the server... Taon takes it to the next level!

- In an Angular/RxJS environment, it’s more than the perfect solution!

**user.controller.ts**
```ts
@Taon.Controller({ className: 'UserController' })
class UserController extends Taon.Base.CrudController<User> {
  entityClassResolveFn = ()=> User;
  //#region @websql
  async initExampleDbData(): Promise<void> {
    const superAdmin = new User();
    superAdmin.name = 'super-admin';
    await this.db.save(superAdmin);
  }
  //#endregion
}
```

**user-api.service.ts**
```ts
@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  userController = Taon.inject(
    () => UserContext.getClass(UserController),
  );

  getAll() {
    return this.userController
      .getAll()
      .received.observable.pipe(map(data => data.body.json));
  }
}
```

**user.component.ts**
```ts
@Component({
  selector: 'app-user',
  template: `
  All users:  {{ users$| async | json }}  
  `
})
export class UserComponent implements OnInit {
  userApiService = inject(UserApiService);
  users$ = this.userApiService.getAll()
}
```

**app.context.ts**
```ts
import { BaseContext, Taon } from 'taon/src';
const host = 'http://localhost:4444'; // host defined once!

const UserContext = await Taon.createContext(()=> {
    host,
    contextName: 'UserContext',
    contexts: { BaseContext },
    controllers: { UserController },
    entities: { User },
    database: true,
  });

// initialize on backend and frontend 
async function start() {
  await UserContext.initialize():   
}
```

## 4. Super easy realtime / sockets communication
- Real-time communication as simple as possible!
- React to entity changes (or custom events) more easily than ever before!

**app.ts**  (*imports*)
```ts
import { Taon, BaseContext } from 'taon/src';
import {
  Observable,
  Subject,
  debounce,
  debounceTime,
  map,
  of,
  scan,
} from 'rxjs';
import {
  CLIENT_DEV_NORMAL_APP_PORT,
  CLIENT_DEV_WEBSQL_APP_PORT,
  HOST_BACKEND_PORT,
} from './app.hosts';
import { Helpers } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
//#region @browser
import { Component, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
//#endregion
```

**app.ts** (*constants*)
```ts
const host = 'http://localhost:' + HOST_BACKEND_PORT;
const frontendHost =
  'http://localhost:' +
  (Helpers.isWebSQL ? CLIENT_DEV_WEBSQL_APP_PORT : CLIENT_DEV_NORMAL_APP_PORT);
const saveNewUserEventKey = 'saveNewUserEventKey';
```

**app.ts** (*angular component + module*)
```ts
//#region @browser
@Component({
  template: `hello from realtime subscribers<br />
    <br />
    <button (click)="saveNewUser()">save new user</button>
    <br />`,
  standalone: false,
})
@UntilDestroy()
export class RealtimeClassSubscriberComponent {
  $destroy = new Subject();
  readonly messages$: Observable<string[]> = of([]);

  saveNewUser() {
    UserContext.realtime.client.triggerCustomEvent(
      saveNewUserEventKey,
    );
  }

  ngOnInit(): void {
    console.log('realtime client subscribers start listening!');

    UserContext.realtime.client
      .listenChangesEntityTable(UserEntity)
      .pipe(untilDestroyed(this), debounceTime(1000))
      .subscribe(message => {
        console.log('realtime message from class subscriber ', message);
      });
  }
}
//#endregion

//#region @browser
@NgModule({
  exports: [RealtimeClassSubscriberComponent],
  imports: [CommonModule],
  declarations: [RealtimeClassSubscriberModule],
})
export class SingleFileModule {}
//#endregion
```
**app.ts** (*user entity*)
```ts
@Taon.Entity({
  className: 'UserEntity',
})
export class UserEntity extends Taon.Base.Entity {
  //#region @websql1
  @Taon.Orm.Column.Generated()
  //#endregion
  id: number;

  //#region @websql
  @Taon.Orm.Column.String()
  //#endregion
  name: string;
}
```

**app.ts** (*user subscriber*)
```ts
@Taon.Subscriber({
  className: 'RealtimeClassSubscriber',
})
export class RealtimeClassSubscriber extends Taon.Base.SubscriberForEntity {
  listenTo() {
    return UserContext.getClass(UserEntity);
  }

  afterInsert(entity: any) {
    console.log(`AFTER INSERT: `, entity);
    UserContext.realtime.server.triggerEntityTableChanges(UserEntity);
  }
}
```

**app.ts** (*user controller*)
```ts
@Taon.Controller({
  className: 'RealtimeUserController',
})
export class RealtimeUserController extends Taon.Base
  .CrudController<UserEntity> {
  entityClassResolveFn = () => UserEntity;

  realtimeClassSubscriber = this.injectSubscriber( ()=> UserContext.getClass(RealtimeClassSubscriber));
  
  async initExampleDbData() {
    //#region @websql
    await this.saveNewUser();
    //#endregion
  }

  async saveNewUser() {
    //#region @websqlFunc
    const counterUser = await this.db.count();
    await this.db.save(
      _.merge(new UserEntity(), { name: 'user' + (counterUser + 1) }),
    );
    Helpers.info(`new user${counterUser + 1} saved.`);

    //#endregion
  }
}
```

**app.ts** (*user context + start function*)
```ts
var UserContext = Taon.createContext(() => ({
  host,
  frontendHost,
  contextName: 'UserContext',
  contexts: { BaseContext },
  controllers: { RealtimeUserController },
  subscribers: { RealtimeClassSubscriber },
  entities: { RealtimeUserEntity: UserEntity },
  database: true,
  logs: {
    realtime: true,
    // db: true,
    // framework: true,
  },
}));

async function start() {
  const userContext = await UserContext.initialize();
  const realtimeUserController = userContext.getClassInstance(RealtimeUserController);

  //#region @websql
  UserContext.realtime.server
    .listenChangesCustomEvent(saveNewUserEventKey)
    .subscribe(async () => {
      console.log('save new user event');
      await realtimeUserController.saveNewUser();
    });
  //#endregion
}

export default start;
```

