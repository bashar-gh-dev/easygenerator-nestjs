import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import * as cookieParser from 'cookie-parser';

const { File, Console } = transports;
const { combine, timestamp, prettyPrint } = format;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new Console({
          format: combine(timestamp(), prettyPrint({ colorize: true })),
        }),
        new File({
          filename: 'combined.log',
          level: 'debug',
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
