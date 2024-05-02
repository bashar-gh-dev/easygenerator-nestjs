import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { HashingService } from './hashing.service';

@Injectable()
export class BcryptService implements HashingService {
  async compare(data: string, hashedData: string) {
    return await compare(data, hashedData);
  }

  async hash(data: string) {
    const slat = await genSalt();
    return hash(data, slat);
  }
}
