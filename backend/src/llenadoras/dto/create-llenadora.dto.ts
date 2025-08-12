import {
  IsString,
  IsBoolean,
  Length,
  MinLength,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLlenadoraDto {
  @IsString()
  @Length(2, 2)
  @Matches(/^\d+$/, {
    message: 'id_llenadora debe contener solo dígitos numéricos',
  })
  @Transform(({ value }) => value.toUpperCase())
  id_llenadora: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nombre_llenadora: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
