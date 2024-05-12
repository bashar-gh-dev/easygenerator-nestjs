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
  const values = {
    databaseName: process.env.DB_DATABASE,
    userName: process.env.DB_PASSWORD,
    password: process.env.DB_USERNAME,
  };
  const validatedConfig = plainToInstance(TypeOrmValidationSchema, values, {
    enableImplicitConversion: true,
  });
  const validationErrors = validateSync(validatedConfig);
  if (validationErrors.length > 0) {
    const invalidKeys = validationErrors
      .map((validationError) => validationError.property)
      .join(', ');
    throw new InternalServerErrorException(
      `Invalid environment key/keys: ${invalidKeys}`,
    );
  }
  return values;
});
