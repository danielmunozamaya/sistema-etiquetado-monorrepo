import { IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRolDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Transform(({ value }) => value.toUpperCase())
  rol: string;
}
