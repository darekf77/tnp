import { META } from '../helpers';
import { PrimaryGeneratedColumn } from 'typeorm/decorator/columns/PrimaryGeneratedColumn';
import { Column } from 'typeorm/decorator/columns/Column';
import { ManyToOne } from 'typeorm/decorator/relations/ManyToOne';
import { CATEGORY } from './CATEGORY';
import { JoinColumn } from 'typeorm/decorator/relations/JoinColumn';
import { Entity } from 'typeorm';
import { CategoryController } from '../controllers';


@Entity(META.tableNameFrom(DIALOG))
export class DIALOG extends META.BASE_ENTITY {

  @PrimaryGeneratedColumn()
  id: number;

  @Column() name: string;


  @ManyToOne(type => CATEGORY, cat => cat.id, {
    cascadeAll: false
  })
  @JoinColumn()
  category: CATEGORY;


}

export default DIALOG;
