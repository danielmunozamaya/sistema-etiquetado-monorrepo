import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdatePresentacionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nombre_presentacion?: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'peso_neto debe tener como máximo 2 decimales' }
  )
  @Min(0.0)
  @Max(99999.99)
  peso_neto?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'peso_bruto debe tener como máximo 2 decimales' }
  )
  @Min(0.0)
  @Max(99999.99)
  peso_bruto?: number;
}
