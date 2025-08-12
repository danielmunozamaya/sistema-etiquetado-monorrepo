import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsNotEmpty,
  IsInt,
  Matches,
  MaxLength,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class CreateManualProduccionDto {
  @IsInt()
  @Min(1)
  @Max(9999999999)
  no_bidon: number;

  @Matches(/^\d{18}$/)
  no_matricula: string;

  @Matches(/^\d{9}$/)
  no_lote: string;

  @Matches(/^\d{2}$/)
  id_llenadora: string;

  @IsIn(['A', 'B', 'C'])
  id_cabezal_llenadora: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  id_producto: string;

  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  familia_producto: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  codigo_ean: string;

  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
  fecha_produccion: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  hora_produccion: string;

  @IsInt()
  @Min(0)
  @Max(60)
  intervalo_minutos: number;

  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
  fecha_caducidad: string;

  @IsInt()
  @Min(1)
  @Max(366)
  code: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.0)
  @Max(9999999.99)
  peso_neto: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.0)
  @Max(9999999.99)
  peso_bruto: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  sscc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  titulo_1?: string;

  @ValidateIf((o) => o.titulo_1 !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  valor_1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  titulo_2?: string;

  @ValidateIf((o) => o.titulo_2 !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  valor_2?: string;

  @IsInt()
  @Min(1)
  @Max(20)
  numero_etiquetas: number;
}
