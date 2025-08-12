import {
  IsString,
  Length,
  IsIP,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CabezalID } from 'src/common/types/common.types';

export class CreateCabezalDto {
  @IsString()
  @Length(2, 2)
  @Transform(({ value }) => value.toUpperCase())
  id_llenadora: string;

  @IsEnum(CabezalID, {
    message:
      'El ID de Cabezal sólo puede tomar los siguientes valores: A, B o C',
  })
  @Length(1, 1)
  @Transform(({ value }) => value.toUpperCase())
  id_cabezal: CabezalID;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nombre_cabezal: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  ruta_impresion: string;
}
