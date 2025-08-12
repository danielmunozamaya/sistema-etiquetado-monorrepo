import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsPositive, Min, ValidateIf } from 'class-validator';
import { PaginationDefaultValues } from '../types/pagination.types';

export class PaginationDto {
  @ValidateIf((o) => o.paginated_response === true)
  @IsInt()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  limit: number = PaginationDefaultValues.LIMIT;

  @ValidateIf((o) => o.paginated_response === true)
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset: number = PaginationDefaultValues.OFFSET;

  @IsBoolean()
  @Type(() => Boolean)
  paginated_response: boolean = Boolean(
    PaginationDefaultValues.PAGINATED_RESPONSE
  );
}
