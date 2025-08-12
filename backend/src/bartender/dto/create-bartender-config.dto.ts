import { IsNotEmpty, IsString, MaxLength, IsInt } from 'class-validator';

export class CreateBartenderConfigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  protocolo_api: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  host: string;

  @IsInt()
  @IsNotEmpty()
  puerto: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  ruta_api: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_integracion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  comando: string;
}
