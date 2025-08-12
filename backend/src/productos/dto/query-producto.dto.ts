import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class QueryProductoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  id_producto?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nombre_producto?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  familia_producto?: string;
}
