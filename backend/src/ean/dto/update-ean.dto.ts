import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateEanDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(36500)
  dias_best_before?: number;
}
