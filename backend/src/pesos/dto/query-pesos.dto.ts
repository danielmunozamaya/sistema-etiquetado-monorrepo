import { IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPesosDto {
  @IsString()
  @Length(2, 2)
  @Transform(({ value }) => value?.toUpperCase())
  id_llenadora: string;

  @IsString()
  @Length(1, 1)
  @Transform(({ value }) => value?.toUpperCase())
  id_cabezal_llenadora: string;
}
