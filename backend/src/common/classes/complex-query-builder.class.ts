import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { ComplexQueryDto, WhereType } from '../dto/complex-query.dto';

type JoinMap = Record<string, string>;

export class ComplexQueryBuilder<T extends ObjectLiteral> {
  private joins: JoinMap = {};
  private alias: string;

  constructor(
    private repo: Repository<T>,
    alias = 't'
  ) {
    this.alias = alias;
  }

  buildQuery(dto: ComplexQueryDto): SelectQueryBuilder<T> {
    let qb = this.repo.createQueryBuilder(this.alias);

    // Analiza todos los campos de select, order y where para hacer los JOINs necesarios
    this.processFieldsForJoins(qb, dto);

    // SELECT
    if (dto.select && dto.select.length > 0) {
      qb = qb.select(dto.select.map((f) => this.fieldWithAlias(f)));
    }

    // WHERE
    if (dto.where) {
      if (Array.isArray(dto.where)) {
        dto.where.forEach((whereObj, idx) => {
          const [condition, params] = this.buildAndWhere(whereObj, idx);
          if (idx === 0) qb = qb.where(condition, params);
          else qb = qb.orWhere(condition, params);
        });
      } else {
        const [condition, params] = this.buildAndWhere(dto.where, 0);
        qb = qb.where(condition, params);
      }
    }

    // ORDER
    if (dto.order) {
      Object.entries(dto.order).forEach(([key, dir]) => {
        qb = qb.addOrderBy(this.fieldWithAlias(key), dir);
      });
    }

    return qb;
  }

  // Método que ejecuta el query y devuelve el array de resultados
  async execute(dto: ComplexQueryDto): Promise<{ data: T[]; total: number }> {
    const qb = this.buildQuery(dto);
    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  // ---------- Helpers privados ----------

  private processFieldsForJoins(
    qb: SelectQueryBuilder<T>,
    dto: ComplexQueryDto
  ) {
    // Recoge todos los campos de select, order y where
    const allFields = [
      ...(dto.select || []),
      ...Object.keys(dto.order || {}),
      ...this.extractWhereFields(dto.where),
    ];

    // Hace JOIN de cada campo de relación si es necesario
    allFields.forEach((field) => {
      this.ensureJoins(qb, field);
    });
  }

  private extractWhereFields(where?: WhereType | WhereType[]): string[] {
    if (!where) return [];
    if (Array.isArray(where)) {
      return where.flatMap((w) => this.extractWhereFields(w));
    }
    let fields = Object.keys(where).filter((f) => f !== 'like');
    // Incluye también los campos de like
    if (where.like) {
      fields = fields.concat(Object.keys(where.like));
    }
    return fields;
  }

  private ensureJoins(qb: SelectQueryBuilder<T>, field: string) {
    const parts = field.split('.');
    if (parts.length <= 1) return; // Campo simple, no join necesario
    let path = '';
    let prevAlias = this.alias;
    for (let i = 0; i < parts.length - 1; i++) {
      path = path ? `${path}.${parts[i]}` : parts[i];
      if (!this.joins[path]) {
        const newAlias = `${prevAlias}_${parts[i]}`;
        qb.leftJoin(`${prevAlias}.${parts[i]}`, newAlias);
        this.joins[path] = newAlias;
        prevAlias = newAlias;
      } else {
        prevAlias = this.joins[path];
      }
    }
  }

  private fieldWithAlias(field: string): string {
    const parts = field.split('.');
    if (parts.length === 1) return `${this.alias}.${field}`;
    let path = '';
    for (let i = 0; i < parts.length - 1; i++) {
      path = path ? `${path}.${parts[i]}` : parts[i];
    }
    const alias = this.joins[path];
    return `${alias}.${parts[parts.length - 1]}`;
  }

  private ensureLikePattern(value: string): string {
    if (typeof value !== 'string') return value;
    if (!value.includes('%') && !value.includes('_')) {
      return `%${value}%`;
    }
    return value;
  }

  private buildAndWhere(
    whereObj: WhereType,
    idx: number
  ): [string, Record<string, any>] {
    const conditions: string[] = [];
    const params: Record<string, any> = {};

    for (const [key, field] of Object.entries(whereObj)) {
      if (typeof field === 'object' && field !== null) {
        // Soporta varios operadores por campo
        for (const [op, value] of Object.entries(field)) {
          const paramKey = `${op}_${idx}_${key.replace(/\./g, '_')}`;
          switch (op) {
            case 'eq':
              conditions.push(`${this.fieldWithAlias(key)} = :${paramKey}`);
              params[paramKey] = value;
              break;
            case 'neq':
              conditions.push(`${this.fieldWithAlias(key)} != :${paramKey}`);
              params[paramKey] = value;
              break;
            case 'lt':
              conditions.push(`${this.fieldWithAlias(key)} < :${paramKey}`);
              params[paramKey] = value;
              break;
            case 'lte':
              conditions.push(`${this.fieldWithAlias(key)} <= :${paramKey}`);
              params[paramKey] = value;
              break;
            case 'gt':
              conditions.push(`${this.fieldWithAlias(key)} > :${paramKey}`);
              params[paramKey] = value;
              break;
            case 'gte':
              conditions.push(`${this.fieldWithAlias(key)} >= :${paramKey}`);
              params[paramKey] = value;
              break;
            case 'in':
              conditions.push(
                `${this.fieldWithAlias(key)} IN (:...${paramKey})`
              );
              params[paramKey] = value;
              break;
            case 'nin':
              conditions.push(
                `${this.fieldWithAlias(key)} NOT IN (:...${paramKey})`
              );
              params[paramKey] = value;
              break;
            case 'isNull':
              if (value) {
                conditions.push(`${this.fieldWithAlias(key)} IS NULL`);
              } else {
                conditions.push(`${this.fieldWithAlias(key)} IS NOT NULL`);
              }
              break;
            case 'like':
              params[paramKey] =
                typeof value === 'string'
                  ? this.ensureLikePattern(value)
                  : value;
              conditions.push(`${this.fieldWithAlias(key)} LIKE :${paramKey}`);
              break;
            case 'between':
              if (
                Array.isArray(value) &&
                value.length === 2 &&
                value[0] !== undefined &&
                value[1] !== undefined
              ) {
                const paramStart = `${paramKey}_start`;
                const paramEnd = `${paramKey}_end`;
                conditions.push(
                  `${this.fieldWithAlias(key)} BETWEEN :${paramStart} AND :${paramEnd}`
                );
                params[paramStart] = value[0];
                params[paramEnd] = value[1];
              }
              break;
          }
        }
      } else {
        // Igualdad directa
        const paramKey = `eq_${idx}_${key.replace(/\./g, '_')}`;
        conditions.push(`${this.fieldWithAlias(key)} = :${paramKey}`);
        params[paramKey] = field;
      }
    }

    return [conditions.length ? conditions.join(' AND ') : '1=1', params];
  }
}
