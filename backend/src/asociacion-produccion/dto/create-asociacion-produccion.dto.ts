import {
  IsOptional,
  IsString,
  Length,
  MaxLength,
  IsNumber,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAsociacionProduccionDto {
  @IsString()
  @Length(2, 2)
  @Transform(({ value }) => value.toUpperCase())
  id_llenadora: string;

  @IsString()
  @Length(1, 1)
  @Transform(({ value }) => value.toUpperCase())
  id_cabezal_llenadora: string;

  @IsOptional()
  @IsString()
  uuid_cabezal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  id_producto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  codigo_ean?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999)
  limite_llenado?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  ruta_etiqueta?: string;
}
