import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { TipoEtiqueta } from 'src/bartender/types/tipo_etiqueta.type';

export class CreateProduccionDto {
  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 2, 3], {
    message:
      'tipo_etiqueta debe ser 1 (AUTOMÁTICA), 2 (SEMIAUTOMÁTICA), o 3 (MANUAL)',
  })
  tipo_etiqueta: TipoEtiqueta;

  // @IsNumber()
  // @IsPositive()
  // @Min(1)
  // no_bidon: number;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  id_llenadora: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1)
  id_cabezal_llenadora: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999)
  peso_neto_real?: number;

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

  @IsOptional()
  @IsNumber()
  @Min(1)
  numero_items?: number;
}
