import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.development.env',
    }),
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.s0uxofe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
      useNewUrlParser: true,
      synchronize: true,
      logging: true,
      entities: [User],
      database: process.env.DB_DATABASE,
    }),
    IamModule,
  ],
})
export class AppModule {}
