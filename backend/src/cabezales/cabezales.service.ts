import {
  Injectable,
  ConflictException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { i18n } from 'src/main';
import { isUUID } from 'src/common/helpers/isUUID.helper';

import { Cabezales } from './entities/cabezal.entity';
import { CreateCabezalDto } from 'src/cabezales/dto/create-cabezales.dto';
import { UpdateCabezalDto } from 'src/cabezales/dto/update-cabezales.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LlenadorasService } from 'src/llenadoras/llenadoras.service';
import { QueryCabezalDto } from './dto/query-cabezal.dto';
import { Paginator } from 'src/common/classes/paginator.class';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { ComplexQueryBuilder } from 'src/common/classes/complex-query-builder.class';
import { buildResponse } from 'src/common/helpers/build-response.helper';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { TransactionalService } from 'src/common/services/transactional.service';
import { PaginationDefaultValues } from 'src/common/types/pagination.types';

@Injectable()
export class CabezalesService
  extends TransactionalService
  implements SyncableService<Cabezales>
{
  constructor(
    @InjectRepository(Cabezales)
    private readonly cabezalesRepo: Repository<Cabezales>,
    dataSource: DataSource,

    @Inject(forwardRef(() => LlenadorasService))
    private readonly llenadorasService: LlenadorasService,
    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService
  ) {
    super(dataSource);
  }

  async createWithTransaction(dto: CreateCabezalDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Cabezales);

      const llenadora = await this.llenadorasService.findOne(
        dto.id_llenadora.toUpperCase(),
        queryRunner
      );

      if (!llenadora) {
        throw new NotFoundException(
          i18n.errors.llenadoraNoExiste(dto.id_llenadora)
        );
      }

      const existing = await repo.findOne({
        where: [
          {
            id_llenadora: dto.id_llenadora.toUpperCase(),
            id_cabezal: dto.id_cabezal.toUpperCase(),
          },
          {
            nombre_cabezal: dto.nombre_cabezal.toUpperCase(),
          },
        ],
      });

      if (existing) {
        throw new ConflictException(
          i18n.errors.cabezalYaExiste(dto.id_cabezal, dto.nombre_cabezal)
        );
      }

      const cabezal = repo.create(dto);
      const cabezalDB = await repo.save(cabezal);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.CABEZALES,
        SyncOperacion.CREATE,
        cabezalDB,
        this.cabezalesRepo.target
      );

      return cabezalDB;
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
    } = paginationDto;

    return this.cabezalesRepo.find({
      where: { visible: true },
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string, queryRunner?: QueryRunner): Promise<Cabezales> {
    const manager = queryRunner?.manager ?? this.cabezalesRepo.manager;

    let cabezal: Cabezales | null = null;

    if (isUUID(term)) {
      cabezal = await manager.findOne(Cabezales, {
        where: { id: term },
      });
    }

    if (!cabezal && !isUUID(term)) {
      const id_llenadora = term.substring(0, 2).toUpperCase();
      const id_cabezal = term.substring(2).toUpperCase();

      cabezal = await manager.findOne(Cabezales, {
        where: {
          id_llenadora,
          id_cabezal,
        },
      });
    }

    if (!cabezal) {
      throw new NotFoundException(i18n.errors.cabezalNoEncontrado(term));
    }

    return cabezal;
  }

  async queryCabezales(query: QueryCabezalDto, paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = false,
    } = paginationDto;

    const where = {
      visible: true,
      ...(query.id_llenadora && { id_llenadora: query.id_llenadora }),
    };

    if (!paginated_response) {
      return this.cabezalesRepo.find({
        where,
        take: limit,
        skip: offset,
      });
    }

    const paginator = new Paginator(this.cabezalesRepo);
    return paginator.paginateRepository(paginationDto, { where });
  }

  async queryCabezalesV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<Cabezales>(
      this.cabezalesRepo
    );
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  async updateWithTransaction(id: string, dto: UpdateCabezalDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Cabezales);

      let cabezal = await this.findOne(id, queryRunner);

      cabezal = { ...cabezal, ...dto };

      const cabezalDB = await repo.save(cabezal);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.CABEZALES,
        SyncOperacion.UPDATE,
        cabezalDB,
        this.cabezalesRepo.target
      );

      return cabezalDB;
    });
  }

  async removeWithTransaction(id: string) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Cabezales);

      const cabezal = await this.findOne(id, queryRunner);

      cabezal.visible = false;

      const cabezalDB = await repo.save(cabezal);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.CABEZALES,
        SyncOperacion.UPDATE,
        cabezalDB,
        this.cabezalesRepo.target
      );

      return cabezalDB;
    });
  }

  getRepository(): Repository<Cabezales> {
    return this.cabezalesRepo;
  }
}
