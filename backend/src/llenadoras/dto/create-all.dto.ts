import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateLlenadoraDto } from './create-llenadora.dto';
import { CreateCabezalDto } from 'src/cabezales/dto/create-cabezales.dto';

export class CreateLlenadoraCabezalesAndAsociacionesDTO extends CreateLlenadoraDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCabezalDto)
  cabezales: CreateCabezalDto[];
}
