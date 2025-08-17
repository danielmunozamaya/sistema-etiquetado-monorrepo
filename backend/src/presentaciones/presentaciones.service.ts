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
import { isUUID } from 'src/common/helpers/isUUID.helper';

import { Presentaciones } from './entities/presentacion.entity';
import { CreatePresentacionDto } from './dto/create-presentacion.dto';
import { UpdatePresentacionDto } from './dto/update-presentacion.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { QueryPresentacionDto } from './dto/query-presentacion.dto';
import { Paginator } from 'src/common/classes/paginator.class';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { ComplexQueryBuilder } from 'src/common/classes/complex-query-builder.class';
import { buildResponse } from 'src/common/helpers/build-response.helper';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { TransactionalService } from 'src/common/services/transactional.service';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { Ean } from 'src/ean/entities/ean.entity';
import { PaginationDefaultValues } from 'src/common/types/pagination.types';

@Injectable()
export class PresentacionesService
  extends TransactionalService
  implements SyncableService<Presentaciones>
{
  constructor(
    @InjectRepository(Presentaciones)
    private readonly presentacionesRepo: Repository<Presentaciones>,
    dataSource: DataSource,

    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService
  ) {
    super(dataSource);
  }

  async createWithTransaction(dto: CreatePresentacionDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Presentaciones);

      const existing = await repo.findOne({
        where: [
          { id_presentacion: dto.id_presentacion.toUpperCase() },
          { nombre_presentacion: dto.nombre_presentacion.toUpperCase() },
        ],
      });

      if (existing) {
        throw new ConflictException(
          i18n.errors.presentacion_yaExiste(dto.id_presentacion)
        );
      }

      const presentacion = repo.create(dto);
      const presentacionDB = await repo.save(presentacion);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.PRESENTACIONES,
        SyncOperacion.CREATE,
        presentacionDB,
        this.presentacionesRepo.target
      );

      return presentacionDB;
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
    } = paginationDto;

    return this.presentacionesRepo.find({
      where: { visible: true },
      take: limit,
      skip: offset,
    });
  }

  async findOne(
    term: string,
    queryRunner?: QueryRunner
  ): Promise<Presentaciones> {
    const manager = queryRunner?.manager ?? this.presentacionesRepo.manager;

    let presentacion: Presentaciones | null = null;

    if (isUUID(term)) {
      presentacion = await manager.findOne(Presentaciones, {
        where: { id: term },
      });
    }

    if (!presentacion && !isUUID(term)) {
      presentacion = await manager
        .createQueryBuilder(Presentaciones, 'presentacion')
        .where('UPPER(presentacion.id_presentacion) = :term', {
          term: term.toUpperCase(),
        })
        .getOne();
    }

    if (!presentacion) {
      throw new NotFoundException(i18n.errors.presentacion_noEncontrada(term));
    }

    return presentacion;
  }

  async queryPresentaciones(
    query: QueryPresentacionDto,
    paginationDto: PaginationDto
  ) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = false,
    } = paginationDto;

    const where = {
      visible: true,
      ...(query.id_presentacion && { id_presentacion: query.id_presentacion }),
      ...(query.nombre_presentacion && {
        nombre_presentacion: query.nombre_presentacion,
      }),
      ...(query.peso_neto !== undefined && { peso_neto: query.peso_neto }),
      ...(query.peso_bruto !== undefined && { peso_bruto: query.peso_bruto }),
    };

    if (!paginated_response) {
      return this.presentacionesRepo.find({
        where,
        take: limit,
        skip: offset,
      });
    }

    const paginator = new Paginator(this.presentacionesRepo);
    return paginator.paginateRepository(paginationDto, { where });
  }

  async queryPresentacionesV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<Presentaciones>(
      this.presentacionesRepo
    );
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  async updateWithTransaction(id: string, dto: UpdatePresentacionDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Presentaciones);

      let presentacion = await this.findOne(id, queryRunner);

      presentacion = { ...presentacion, ...dto };

      const presentacionDB = await repo.save(presentacion);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.PRESENTACIONES,
        SyncOperacion.UPDATE,
        presentacionDB,
        this.presentacionesRepo.target
      );

      return presentacionDB;
    });
  }

  async removeWithTransaction(id: string) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Presentaciones);
      const eanRepo = queryRunner.manager.getRepository(Ean);
      const asociacionRepo =
        queryRunner.manager.getRepository(AsociacionProduccion);

      const presentacion = await this.findOne(id, queryRunner);

      const ean = await eanRepo.findOneBy({
        id_presentacion: presentacion.id_presentacion,
      });

      if (ean) {
        const asociacion = await asociacionRepo.findOne({
          where: { codigo_ean: ean.codigo_ean },
          relations: ['llenadora'],
        });

        if (asociacion) {
          const message = asociacion.llenadora?.nombre_llenadora
            ? i18n.errors.presentacion_noSePuedeEliminarAsociadaLlenadora(
                presentacion.nombre_presentacion,
                asociacion.llenadora.nombre_llenadora
              )
            : i18n.errors.presentacion_noSePuedeEliminarAsociada(
                presentacion.nombre_presentacion
              );
          throw new ConflictException(message);
        }
      }

      presentacion.visible = false;

      const presentacionDB = await repo.save(presentacion);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.PRESENTACIONES,
        SyncOperacion.UPDATE,
        presentacionDB,
        this.presentacionesRepo.target
      );

      return presentacionDB;
    });
  }

  getRepository(): Repository<Presentaciones> {
    return this.presentacionesRepo;
  }
}
