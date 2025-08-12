import { IsOptional, IsString, Length } from 'class-validator';

export class QueryCabezalDto {
  @IsOptional()
  @IsString()
  @Length(2, 2)
  id_llenadora?: string;
}
