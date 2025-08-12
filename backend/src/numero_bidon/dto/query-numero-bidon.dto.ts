import { IsString, Length, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryNumeroBidonDto {
  @IsString()
  @Length(2, 2)
  @Transform(({ value }) => value?.toUpperCase())
  id_llenadora: string;

  @IsString()
  @Length(1, 1)
  @Transform(({ value }) => value?.toUpperCase())
  id_cabezal_llenadora: string;

  @IsInt()
  @Min(1900)
  @Max(9999)
  anio: number;
}
