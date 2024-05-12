import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @ObjectIdColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  @Index({ unique: true })
  email: string;

  @Column()
  password: string;
}
