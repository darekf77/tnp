import { ENDPOINT, CLASSNAME, BaseCRUDEntity } from 'morphi';
import { META } from 'baseline/ss-common-logic/src/helpers';
import { BUILD } from '../entities/BUILD';


//#region @backend
import * as entities from '../entities';
import * as controllers from '../controllers';
//#endregion

@ENDPOINT()
@CLASSNAME('BuildController')
export class BuildController extends META.BASE_CONTROLLER<BUILD> {

  //#region @backend
  @BaseCRUDEntity(entities.BUILD) public entity: entities.BUILD;


  get db() {
    return entities.entities(this.connection as any)
  }

  get ctrl() {
    return controllers.controllers()
  }


  async initExampleDbData() {


    await this.db.BUILD.save(this.db.BUILD.create({
      gitFolder: '/projects/baseline',
      gitRemote: 'https://github.com/darekf77/tsc-npm-project.git'
    }))

    console.log('example builds loaded!')

  }
  //#endregion

}

export default BuildController;
