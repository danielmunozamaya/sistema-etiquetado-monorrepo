import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, QueryRunner, Repository } from 'typeorm';
import { i18n } from 'src/main';
import { validate as isUUID } from 'uuid';

import { Ean } from './entities/ean.entity';
import { CreateEanDto } from './dto/create-ean.dto';
import { UpdateEanDto } from './dto/update-ean.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductosService } from 'src/productos/productos.service';
import { PresentacionesService } from 'src/presentaciones/presentaciones.service';
import { QueryEanDto } from './dto/query-ean.dto';
import { Paginator } from 'src/common/classes/paginator.class';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { ComplexQueryBuilder } from 'src/common/classes/complex-query-builder.class';
import { buildResponse } from 'src/common/helpers/build-response';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { TransactionalService } from 'src/common/services/transactional.service';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { PaginationDefaultValues } from 'src/common/types/pagination.types';

@Injectable()
export class EanService
  extends TransactionalService
  implements SyncableService<Ean>
{
  constructor(
    @InjectRepository(Ean)
    private readonly eanRepo: Repository<Ean>,
    dataSource: DataSource,

    private readonly productosService: ProductosService,
    private readonly presentacionesService: PresentacionesService,
    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService
  ) {
    super(dataSource);
  }

  async createWithTransaction(dto: CreateEanDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Ean);

      const producto = await this.productosService.findOne(
        dto.id_producto,
        queryRunner
      );

      if (!producto) {
        throw new ForbiddenException(
          i18n.errors.ean_productoNoExiste(dto.id_producto)
        );
      }

      const presentacion = await this.presentacionesService.findOne(
        dto.id_presentacion,
        queryRunner
      );

      if (!presentacion) {
        throw new ForbiddenException(
          i18n.errors.ean_presentacionNoExiste(dto.id_presentacion)
        );
      }

      const existing = await repo.findOne({
        where: [
          { codigo_ean: dto.codigo_ean.toUpperCase() },
          { id_presentacion: dto.id_presentacion.toUpperCase() },
        ],
      });

      if (existing) {
        throw new ConflictException(
          i18n.errors.ean_yaExiste(dto.codigo_ean, dto.id_presentacion)
        );
      }

      const ean = repo.create(dto);
      const eanDB = await repo.save(ean);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.EAN,
        SyncOperacion.CREATE,
        eanDB,
        this.eanRepo.target
      );

      return eanDB;
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
    } = paginationDto;

    return this.eanRepo.find({
      where: { visible: true },
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string, queryRunner?: QueryRunner): Promise<Ean> {
    const manager = queryRunner?.manager ?? this.eanRepo.manager;

    let ean: Ean | null = null;

    if (isUUID(term)) {
      ean = await manager.findOne(Ean, {
        where: { id: term },
      });
    }

    if (!ean && !isUUID(term)) {
      ean = await manager
        .createQueryBuilder(Ean, 'ean')
        .where('ean.codigo_ean = :term', { term })
        .getOne();
    }

    if (!ean) {
      throw new NotFoundException(i18n.errors.ean_noEncontrado(term));
    }

    return ean;
  }

  async queryEans(query: QueryEanDto, paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = false,
    } = paginationDto;

    const where = {
      visible: true,
      ...(query.id_producto && { id_producto: query.id_producto }),
      ...(query.id_presentacion && { id_presentacion: query.id_presentacion }),
      ...(query.codigo_ean && { codigo_ean: query.codigo_ean }),
      ...(query.dias_best_before !== undefined && {
        dias_best_before: query.dias_best_before,
      }),
    };

    if (!paginated_response) {
      return this.eanRepo.find({
        where,
        take: limit,
        skip: offset,
      });
    }

    const paginator = new Paginator(this.eanRepo);
    return paginator.paginateRepository(paginationDto, { where });
  }

  async queryEansV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<Ean>(this.eanRepo);
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  async updateWithTransaction(id: string, dto: UpdateEanDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Ean);

      const ean = await this.findOne(id, queryRunner);

      Object.assign(ean, dto);

      const eanDB = await repo.save(ean);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.EAN,
        SyncOperacion.UPDATE,
        eanDB,
        this.eanRepo.target
      );

      return eanDB;
    });
  }

  async removeWithTransaction(id: string) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Ean);
      const asociacionRepo =
        queryRunner.manager.getRepository(AsociacionProduccion);

      const ean = await this.findOne(id, queryRunner);

      const asociacion = await asociacionRepo.findOne({
        where: { codigo_ean: ean.codigo_ean },
        relations: ['llenadora'],
      });

      if (asociacion) {
        const message = asociacion.llenadora?.nombre_llenadora
          ? i18n.errors.ean_noSePuedeEliminarAsociadoLlenadora(
              ean.codigo_ean,
              asociacion.llenadora.nombre_llenadora
            )
          : i18n.errors.ean_noSePuedeEliminarAsociado(ean.codigo_ean);
        throw new ConflictException(message);
      }

      ean.visible = false;

      const eanDB = await repo.save(ean);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.EAN,
        SyncOperacion.UPDATE,
        eanDB,
        this.eanRepo.target
      );

      return eanDB;
    });
  }

  getRepository(): Repository<Ean> {
    return this.eanRepo;
  }
}
