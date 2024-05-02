import { Column, Entity, ObjectIdColumn, ObjectId } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;
}
