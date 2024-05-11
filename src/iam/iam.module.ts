import { Module } from '@nestjs/common';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { RefreshTokenStorageService } from './refresh-token-storage.service';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UsersModule,
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService, // you can easily change your hashing service here
    },
    AuthenticationService,
    RefreshTokenStorageService,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
