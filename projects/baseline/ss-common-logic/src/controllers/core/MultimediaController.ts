
import {
  ENDPOINT, GET, POST, PUT, DELETE, isNode, Connection,
  PathParam, QueryParam, CookieParam, HeaderParam, BodyParam,
  Response, OrmConnection, Errors, isBrowser, BaseCRUDEntity
} from 'morphi';


//#region @backend
import { authenticate, use } from 'passport';
import { Strategy, IStrategyOptions } from 'passport-http-bearer';
import { isEmail, isLowercase, isLength } from 'validator';
import * as q from 'q';
import { Handler } from 'express';
export { Handler } from 'express';
import * as bcrypt from 'bcrypt';
import * as graph from 'fbgraph';
import * as path from 'path';
//#endregion

import { META } from '../../helpers';

import * as entities from '../../entities';
import * as controllers from '../../controllers';

@ENDPOINT({
  auth: (method) => {
    //#region @backendFunc
    return authenticate('bearer', { session: false });
    //#endregion
  }
})
export class MultimediaController extends META.BASE_CONTROLLER<entities.MULTIMEDIA> {


  //#region @backend
  @OrmConnection connection: Connection;
  @BaseCRUDEntity(entities.SESSION) entity: entities.MULTIMEDIA;

  get db() {
    return entities.entities(this.connection as any);
  }

  get ctrl() {
    return controllers.controllers()
  }


  async initExampleDbData() {

    let m1 = new entities.MULTIMEDIA()
    m1.type = 'picture';


    m1 = await this.db.MULTIMEDIA.save(m1)

    console.log(m1.path)

  }
  //#endregion




}
