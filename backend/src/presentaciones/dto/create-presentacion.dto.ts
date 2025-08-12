import {
  IsString,
  Length,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreatePresentacionDto {
  @IsString()
  @Length(1, 15)
  id_presentacion: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nombre_presentacion: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'peso_neto debe tener como máximo 2 decimales' }
  )
  @Min(0.0)
  @Max(99999.99)
  peso_neto: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'peso_bruto debe tener como máximo 2 decimales' }
  )
  @Min(0.0)
  @Max(99999.99)
  peso_bruto: number;
}
