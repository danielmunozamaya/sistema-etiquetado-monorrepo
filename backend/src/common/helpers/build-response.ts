import { PaginationDto } from '../dto/pagination.dto';
import { PaginationResponse } from '../interfaces/pagination-response.interface';
import { PaginationDefaultValues } from '../types/pagination.types';

function getRange<T>(data: T[], length: number, startIndex: number = 0){
  return data.slice(startIndex, startIndex + length);
}

export function buildResponse<T>(
  data: T[],
  total: number,
  paginationDto: PaginationDto
): T[] | PaginationResponse<T> {
  const {
    limit = PaginationDefaultValues.LIMIT,
    offset = PaginationDefaultValues.OFFSET,
    paginated_response = PaginationDefaultValues.PAGINATED_RESPONSE,
  } = paginationDto;

  if (!paginated_response) return data;

  const actualPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const pageSize = limit;
  const dataLength = data.length;
  const lastPage = actualPage > 1 ? actualPage - 1 : null;
  const nextPage = actualPage < totalPages ? actualPage + 1 : null;
  const lastOffset = lastPage ? (lastPage - 1) * limit : null;
  const nextOffset = nextPage ? (nextPage - 1) * limit : null;

  return {
    actualPage,
    totalPages,
    pageSize,
    dataLength,
    lastPage,
    nextPage,
    lastOffset,
    nextOffset,
    data: getRange(data, limit, offset),
  };
}
