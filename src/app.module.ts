import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { IamModule } from './iam/iam.module';
import typeOrmConfig from './config/type-orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['src/.env/jwt.env', 'src/.env/type-orm.env'],
    }),
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(typeOrmConfig)],
      inject: [typeOrmConfig.KEY],
      useFactory: (typeOrmConfiguration: ConfigType<typeof typeOrmConfig>) => {
        return {
          type: 'mongodb',
          url: `mongodb+srv://${typeOrmConfiguration.userName}:${typeOrmConfiguration.password}@cluster0.s0uxofe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
          useNewUrlParser: true,
          synchronize: true,
          logging: true,
          entities: [User],
          database: typeOrmConfiguration.databaseName,
        };
      },
    }),
    IamModule,
  ],
})
export class AppModule {}
