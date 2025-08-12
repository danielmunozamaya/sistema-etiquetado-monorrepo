export interface PaginationResponse<T> {
  actualPage: number;
  totalPages: number;
  pageSize: number;
  dataLength: number;
  lastPage: number | null;
  nextPage: number | null;
  lastOffset: number | null;
  nextOffset: number | null;
  data: T[];
}
