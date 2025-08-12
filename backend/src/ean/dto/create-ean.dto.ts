import { IsString, Length, IsNumber, Min, Max } from 'class-validator';

export class CreateEanDto {
  @IsString()
  @Length(1, 30)
  codigo_ean: string;

  @IsString()
  @Length(1, 30)
  id_producto: string;

  @IsString()
  @Length(1, 15)
  id_presentacion: string;

  @IsNumber()
  @Min(1)
  @Max(36500)
  dias_best_before: number;
}
