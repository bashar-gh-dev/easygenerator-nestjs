import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
  ],
})
export class AppModule {}
