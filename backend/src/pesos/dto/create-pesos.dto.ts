import { IsIn, IsNumber, IsString, Length, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

// Sólo para tenerlo como referencia en la creación de Pesos ficticios del Seed
export class CreatePesosDto {
  @IsString()
  @Length(2, 2)
  @Transform(({ value }) => value?.toUpperCase())
  id_llenadora: string;

  @IsString()
  @Length(1, 1)
  @Transform(({ value }) => value?.toUpperCase())
  id_cabezal_llenadora: string;

  @IsNumber()
  @Min(0.0)
  @Max(999999999.99)
  peso_plc: number;

  @IsNumber()
  @IsIn([0, 1])
  orden_impresion: number;
}
