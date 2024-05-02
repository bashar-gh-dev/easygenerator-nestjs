import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';

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
  await app.listen(3000);
}
bootstrap();
