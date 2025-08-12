// src/produccion/dto/filter-produccion.dto.ts
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

export class FilterProduccionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  id_llenadora?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1)
  id_cabezal_llenadora?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  estado?: number;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  registrado?: number;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3])
  tipo_etiqueta?: number;

  @IsOptional()
  @IsString()
  fecha_desde?: string;

  @IsOptional()
  @IsString()
  fecha_hasta?: string;

  @IsOptional()
  @IsString()
  hora_desde?: string;

  @IsOptional()
  @IsString()
  hora_hasta?: string;
}
