import {
  IsString,
  Length,
  MaxLength,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMotivoBajaDto {
  @IsString()
  @Length(1, 5)
  @Transform(({ value }) => value.toUpperCase())
  codigo_baja: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nombre_baja: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  descripcion_baja?: string;
}
