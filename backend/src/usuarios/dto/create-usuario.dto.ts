import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  nombre: string;

  @IsString()
  @MinLength(6)
  @MaxLength(40)
  password: string;

  @IsString()
  rol: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  ruta_impresion_manual: string;
}
