import { Injectable } from '@nestjs/common';

// Each hashing service should implement this abstraction
@Injectable()
export abstract class HashingService {
  abstract compare(data: string, hashedData: string): Promise<boolean>;
  abstract hash(data: string): Promise<string>;
}
