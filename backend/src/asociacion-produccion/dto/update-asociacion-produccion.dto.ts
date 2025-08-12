import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class UpdateAsociacionProduccionDto {
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
  @MaxLength(500)
  ruta_etiqueta?: string;
}
