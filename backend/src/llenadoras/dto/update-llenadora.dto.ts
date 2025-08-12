import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateLlenadoraDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nombre_llenadora: string;
}
