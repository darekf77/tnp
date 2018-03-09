import { Column  } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn  } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { Entity } from "typeorm/decorator/entity/Entity";

import { Author } from "./Author";
import { Book } from "./Book";

@Entity(TestUser.name)
export class TestUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    username: string;

    friend: Author;

    books: Book[];

    public isAmazing() {
        return 'is amazing person'
    }
}

export default TestUser;