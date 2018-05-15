import { META } from '../../helpers';
//#region typeorm imports
import { Connection } from "typeorm/connection/Connection";
import { Repository } from "typeorm/repository/Repository";
import { AfterInsert } from "typeorm/decorator/listeners/AfterInsert";
import { AfterUpdate } from "typeorm/decorator/listeners/AfterUpdate";
import { BeforeUpdate } from "typeorm/decorator/listeners/BeforeUpdate";
import { OneToMany } from "typeorm/decorator/relations/OneToMany";
import { ManyToMany } from "typeorm/decorator/relations/ManyToMany";
import { JoinTable } from "typeorm/decorator/relations/JoinTable";
import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryColumn } from "typeorm/decorator/columns/PrimaryColumn";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CreateDateColumn } from "typeorm/decorator/columns/CreateDateColumn";
import { getCustomRepository } from 'typeorm';
//#endregion

//#region @backend
import * as path from "path";
import * as fse from "fs-extra";
import * as fs from "fs";
//#endregion
import { kebabCase } from "lodash";


export interface IMULTIMEDIA {

}

@Entity(META.tableNameFrom(MULTIMEDIA))
export class MULTIMEDIA extends META.BASE_ENTITY<MULTIMEDIA, IMULTIMEDIA> implements IMULTIMEDIA {


  @PrimaryGeneratedColumn()
  id: number = undefined;

  @CreateDateColumn()
  createdDate: Date = undefined

  @Column('varchar', { length: 200, nullable: true })
  name: string = null



  @Column('varchar', { length: 20 })
  type: 'picture' | 'audio' | 'video' = undefined;

  //#region @backend
  private static folderPath = path.join(ENV.pathes.backup.audio, ENV.packageJson.name);
  //#endregion

  get path() {
    //#region @backendFunc
    if (!this.type) {
      throw Error(`Bad multimedia type for id ${this.id}`)
    }

    let name = `${this.type}_${this.id}__${kebabCase(this.createdDate.getTime().toString())}_${this.name}`;

    const res = path.join(MULTIMEDIA.folderPath, name)

    return res;
    //#endregion
  }

  public static recreateFolder() {
    //#region @backend
    MULTIMEDIA.folderPath = path.join(ENV.pathes.backup.audio, ENV.packageJson.name);
    if (!fs.existsSync(MULTIMEDIA.folderPath)) {
      fse.mkdirpSync(MULTIMEDIA.folderPath)
    }
    //#endregion
  }

  fromRaw(obj: IMULTIMEDIA): MULTIMEDIA {
    throw new Error("Method not implemented.");
  }


}

export interface MULTIMEDIA_ALIASES {
  //#region @backend
  picture: string;
  audio: string;
  video: string;
  //#endregion
}


@EntityRepository(MULTIMEDIA)
export class MULTIMEDIA_REPOSITORY extends META.BASE_REPOSITORY<MULTIMEDIA, MULTIMEDIA_ALIASES> {

  //#region @backend
  globalAliases: (keyof MULTIMEDIA_ALIASES)[] = ['audio', 'video', 'picture']
  //#endregion


}

