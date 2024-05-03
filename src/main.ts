import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule, utilities } from 'nest-winston';
import { format, transports } from 'winston';
import * as cookieParser from 'cookie-parser';

const { File, Console } = transports;
const { combine, timestamp } = format;
const {
  format: { nestLike },
} = utilities;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new Console({
          format: combine(
            timestamp(),
            nestLike('Easygenerator', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        new File({
          filename: 'errors.log',
          level: 'error',
        }),
      ],
    }),
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
