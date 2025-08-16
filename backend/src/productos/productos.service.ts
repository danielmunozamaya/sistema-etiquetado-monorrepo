import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, QueryRunner, Repository } from 'typeorm';
import { i18n } from 'src/main';
import { validate as isUUID } from 'uuid';

import { Productos } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Paginator } from 'src/common/classes/paginator.class';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { QueryProductoDto } from './dto/query-producto.dto';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { buildResponse } from 'src/common/helpers/build-response';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { ComplexQueryBuilder } from 'src/common/classes/complex-query-builder.class';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { TransactionalService } from 'src/common/services/transactional.service';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { PaginationDefaultValues } from 'src/common/types/pagination.types';

@Injectable()
export class ProductosService
  extends TransactionalService
  implements SyncableService<Productos>
{
  constructor(
    @InjectRepository(Productos)
    private readonly productosRepo: Repository<Productos>,
    dataSource: DataSource,
    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService
  ) {
    super(dataSource);
  }

  async createWithTransaction(dto: CreateProductoDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Productos);

      const existing = await repo.findOne({
        where: [
          { id_producto: dto.id_producto.toUpperCase() },
          { nombre_producto: dto.nombre_producto.toUpperCase() },
        ],
      });

      if (existing) {
        throw new ConflictException(
          i18n.errors.producto_yaExiste(dto.id_producto, dto.nombre_producto)
        );
      }

      const producto = repo.create(dto);
      const productoDB = await repo.save(producto);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.PRODUCTOS,
        SyncOperacion.CREATE,
        productoDB,
        this.productosRepo.target
      );

      return productoDB;
    });
  }

  async findAll(
    paginationDto: PaginationDto
  ): Promise<PaginationResponse<Productos> | Productos[]> {
    const [data, total] = await this.productosRepo.findAndCount({
      where: { visible: true },
      take: paginationDto.limit,
      skip: paginationDto.offset,
    });

    return buildResponse(data, total, paginationDto);
  }

  async findOne(term: string, queryRunner?: QueryRunner): Promise<Productos> {
    const manager = queryRunner?.manager ?? this.productosRepo.manager;

    let producto: Productos | null = null;

    if (isUUID(term)) {
      producto = await manager.findOne(Productos, {
        where: { id: term },
      });
    }

    if (!producto && !isUUID(term)) {
      producto = await manager
        .createQueryBuilder(Productos, 'producto')
        .where('UPPER(producto.id_producto) = :term', {
          term: term.toUpperCase(),
        })
        .getOne();
    }

    if (!producto) {
      throw new NotFoundException(i18n.errors.producto_noEncontrado(term));
    }

    return producto;
  }

  async updateWithTransaction(id: string, dto: UpdateProductoDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Productos);

      let producto = await this.findOne(id, queryRunner);
      producto = { ...producto, ...dto };

      const productoDB = await repo.save(producto);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.PRODUCTOS,
        SyncOperacion.UPDATE,
        productoDB,
        this.productosRepo.target
      );

      return productoDB;
    });
  }

  async removeWithTransaction(id: string) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Productos);
      const asociacionRepo =
        queryRunner.manager.getRepository(AsociacionProduccion);

      const producto = await this.findOne(id, queryRunner);

      const asociacion = await asociacionRepo.findOne({
        where: { id_producto: producto.id_producto },
        relations: ['llenadora'],
      });

      if (asociacion) {
        const message = asociacion.llenadora?.nombre_llenadora
          ? i18n.errors.producto_noSePuedeEliminarAsociadoLlenadora(
              producto.nombre_producto,
              asociacion.llenadora.nombre_llenadora
            )
          : i18n.errors.producto_noSePuedeEliminarAsociado(
              producto.nombre_producto
            );
        throw new ConflictException(message);
      }

      producto.visible = false;

      const productoDB = await repo.save(producto);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.PRODUCTOS,
        SyncOperacion.UPDATE,
        productoDB,
        this.productosRepo.target
      );

      return productoDB;
    });
  }

  async findAllFamilias(
    paginationDto: PaginationDto
  ): Promise<string[] | PaginationResponse<string>> {
    const qb = this.productosRepo
      .createQueryBuilder('producto')
      .select('DISTINCT producto.familia_producto', 'familia_producto')
      .where('producto.visible = :visible', { visible: true })
      .orderBy('producto.familia_producto', 'ASC');

    const paginator = new Paginator(this.productosRepo);
    return paginator.paginateRawQueryBuilder(
      qb,
      paginationDto,
      (row) => row.familia_producto
    );
  }

  async findByFamilia(familia: string): Promise<Productos[]> {
    return this.productosRepo.find({
      where: {
        familia_producto: familia.toUpperCase(),
        visible: true,
      },
      order: {
        nombre_producto: 'ASC',
      },
    });
  }

  async queryProductos(query: QueryProductoDto, paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = false,
    } = paginationDto;

    const where = {
      visible: true,
      ...(query.id_producto && { id_producto: query.id_producto }),
      ...(query.nombre_producto && { nombre_producto: query.nombre_producto }),
      ...(query.familia_producto && {
        familia_producto: query.familia_producto,
      }),
    };

    if (!paginated_response) {
      return this.productosRepo.find({
        where,
        take: limit,
        skip: offset,
      });
    }

    const paginator = new Paginator(this.productosRepo);
    return paginator.paginateRepository(paginationDto, { where });
  }

  async queryProductosV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<Productos>(
      this.productosRepo
    );
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  getRepository(): Repository<Productos> {
    return this.productosRepo;
  }
}
