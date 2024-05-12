import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, validateSync } from 'class-validator';

export class TypeOrmValidationSchema {
  @IsNotEmpty() @IsString() databaseName: string;
  @IsNotEmpty() @IsString() userName: string;
  @IsNotEmpty() @IsString() password: string;
}

export default registerAs('typeOrm', () => {
  const config = {
    databaseName: process.env.DB_DATABASE,
    userName: process.env.DB_PASSWORD,
    password: process.env.DB_USERNAME,
  };
  const configSchema = plainToInstance(TypeOrmValidationSchema, config, {
    enableImplicitConversion: true,
  });
  const validationErrors = validateSync(configSchema);
  if (validationErrors.length > 0) {
    const invalidKeys = validationErrors
      .map((validationError) => validationError.property)
      .join(', ');
    throw new InternalServerErrorException(
      `Invalid environment key/keys: ${invalidKeys}`,
    );
  }
  return configSchema;
});
