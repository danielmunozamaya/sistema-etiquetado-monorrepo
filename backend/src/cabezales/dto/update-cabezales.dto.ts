import {
  IsString,
  IsIP,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateCabezalDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nombre_cabezal?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  ruta_impresion?: string;
}
