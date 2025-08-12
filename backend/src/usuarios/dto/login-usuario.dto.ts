import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUsuarioDto {
  @IsString()
  @MinLength(6)
  @MaxLength(40)
  nombre: string;

  @IsString()
  @MinLength(6)
  @MaxLength(40)
  password: string;
}
