import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateProductoDto {
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
