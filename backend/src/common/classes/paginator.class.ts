// common/utils/paginator.class.ts
import {
  Repository,
  ObjectLiteral,
  SelectQueryBuilder,
  FindOptionsWhere,
  FindOptionsRelations,
} from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginationResponse } from '../interfaces/pagination-response.interface';
import { PaginationDefaultValues } from '../types/pagination.types';

export class Paginator<T extends ObjectLiteral> {
  constructor(private readonly repo: Repository<T>) {}

  // Método para paginar con repositorio + filtros opcionales
  async paginateRepository(
    paginationDto: PaginationDto,
    options?: {
      where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
      relations?: FindOptionsRelations<T>;
    }
  ): Promise<PaginationResponse<T>> {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
    } = paginationDto;

    const [data, total] = await this.repo.findAndCount({
      take: limit,
      skip: offset,
      where: options?.where,
      relations: options?.relations,
    });

    return this.buildResponse(data, total, limit, offset);
  }

  // Método para paginar con QueryBuilder (sin cambios)
  async paginateQueryBuilder<R = any>(
    qb: SelectQueryBuilder<any>,
    paginationDto: PaginationDto,
    mapFn?: (row: any) => R
  ): Promise<PaginationResponse<R> | R[]> {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = false,
    } = paginationDto;

    const totalQb = qb.clone();

    const entities = await qb.take(limit).skip(offset).getMany();
    const data = mapFn ? entities.map(mapFn) : entities;

    if (!paginated_response) {
      return data;
    }

    const total = await totalQb.getCount();

    return this.buildResponse(data, total, limit, offset);
  }

  async paginateRawQueryBuilder<R = any>(
    qb: SelectQueryBuilder<any>,
    paginationDto: PaginationDto,
    mapFn?: (row: any) => R
  ): Promise<PaginationResponse<R> | R[]> {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = false,
    } = paginationDto;

    const totalQb = qb.clone();

    const rows = await qb.take(limit).skip(offset).getRawMany();
    let data = mapFn ? rows.map(mapFn) : rows;

    // Sustituye [null] por []
    if (Array.isArray(data)) {
      data = data.filter((item) => item !== null && item !== undefined);
    }

    if (!paginated_response) {
      return data;
    }

    // getCount no es fiable con SELECT personalizados → contamos manualmente
    const totalRows = await totalQb.getRawMany();
    const total = mapFn
      ? totalRows.map(mapFn).filter((x) => x !== null).length
      : totalRows.length;

    return this.buildResponse(data, total, limit, offset);
  }

  // Método privado para construir la respuesta paginada (sin cambios)
  private buildResponse<R>(
    data: R[],
    total: number,
    limit: number,
    offset: number
  ): PaginationResponse<R> {
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
      data,
    };
  }
}
