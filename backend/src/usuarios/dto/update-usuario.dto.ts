import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(40)
  password?: string;
}
