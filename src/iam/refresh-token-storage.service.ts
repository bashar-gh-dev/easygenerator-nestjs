import { Injectable } from '@nestjs/common';

/*
To do later: we can use Redis instead
*/
const refreshTokens: { [userId: string]: string } = {};

@Injectable()
export class RefreshTokenStorageService {
  async validate(userId: string, refreshToken: string): Promise<boolean> {
    return refreshTokens[userId] === refreshToken;
  }

  async invalidate(userId: string): Promise<void> {
    delete refreshTokens[userId];
  }

  async set(userId: string, refreshToken: string): Promise<void> {
    refreshTokens[userId] = refreshToken;
  }
}
