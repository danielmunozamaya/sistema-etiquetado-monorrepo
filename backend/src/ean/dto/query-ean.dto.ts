import {
  IsOptional,
  IsString,
  Length,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class QueryEanDto {
  @IsOptional()
  @IsString()
  @Length(1, 30)
  id_producto?: string;

  @IsOptional()
  @IsString()
  @Length(1, 15)
  id_presentacion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  codigo_ean?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(36500)
  dias_best_before?: number;
}
