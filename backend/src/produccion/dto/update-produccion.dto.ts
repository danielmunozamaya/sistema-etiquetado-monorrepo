import {
  // IsOptional,
  // IsUUID,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateProduccionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5)
  codigo_baja: string;
}
