import { IsString, Length, MinLength, MaxLength } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @Length(1, 30)
  id_producto: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nombre_producto: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  familia_producto: string;
}
