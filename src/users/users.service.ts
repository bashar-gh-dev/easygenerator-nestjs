import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
  ) {}

  async create(createUserDto: User) {
    return await this.usersRepository.save(createUserDto);
  }

  async findById(id: string) {
    return await this.usersRepository.findOne({
      where: { _id: new ObjectId(id) }, // typeORM is just disgusting, when using it with NoSQL db *_*
    });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }
}
