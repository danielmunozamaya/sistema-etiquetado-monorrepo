import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMotivoBajaDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nombre_baja?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  descripcion_baja?: string;
}
