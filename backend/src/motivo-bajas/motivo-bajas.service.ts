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

import { MotivoBajas } from './entities/motivo-baja.entity';
import { CreateMotivoBajaDto } from './dto/create-motivo-baja.dto';
import { UpdateMotivoBajaDto } from './dto/update-motivo-baja.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { TransactionalService } from 'src/common/services/transactional.service';
import { PaginationDefaultValues } from 'src/common/types/pagination.types';

@Injectable()
export class MotivoBajasService
  extends TransactionalService
  implements SyncableService<MotivoBajas>
{
  constructor(
    @InjectRepository(MotivoBajas)
    private readonly motivoBajaRepo: Repository<MotivoBajas>,
    dataSource: DataSource,

    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService
  ) {
    super(dataSource);
  }

  async createWithTransaction(dto: CreateMotivoBajaDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(MotivoBajas);

      const existing = await repo.findOne({
        where: [
          { codigo_baja: dto.codigo_baja.toUpperCase() },
          { nombre_baja: dto.nombre_baja.toUpperCase() },
        ],
      });

      if (existing) {
        throw new ConflictException(
          i18n.errors.motivoBaja_yaExiste(dto.codigo_baja, dto.nombre_baja)
        );
      }

      const motivo = repo.create(dto);
      const motivoDB = await repo.save(motivo);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.MOTIVO_BAJAS,
        SyncOperacion.CREATE,
        motivoDB,
        this.motivoBajaRepo.target
      );

      return motivoDB;
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
    } = paginationDto;

    return this.motivoBajaRepo.find({
      where: { visible: true },
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string, queryRunner?: QueryRunner) {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(MotivoBajas)
      : this.motivoBajaRepo;

    let motivo: MotivoBajas | null = null;

    if (isUUID(term)) {
      motivo = await repo.findOneBy({ id: term });
    }

    if (!motivo && !isUUID(term)) {
      motivo = await repo
        .createQueryBuilder('motivo')
        .where('UPPER(motivo.codigo_baja) = :term', {
          term: term.toUpperCase(),
        })
        .getOne();
    }

    if (!motivo) {
      throw new NotFoundException(i18n.errors.motivoBaja_noEncontrado(term));
    }

    return motivo;
  }

  async updateWithTransaction(id: string, dto: UpdateMotivoBajaDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(MotivoBajas);

      const motivo = await this.findOne(id, queryRunner);
      Object.assign(motivo, dto);

      const motivoDB = await repo.save(motivo);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.MOTIVO_BAJAS,
        SyncOperacion.UPDATE,
        motivoDB,
        this.motivoBajaRepo.target
      );

      return motivoDB;
    });
  }

  async removeWithTransaction(id: string) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(MotivoBajas);

      const motivo = await this.findOne(id, queryRunner);

      motivo.visible = false;

      const motivoDB = await repo.save(motivo);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.MOTIVO_BAJAS,
        SyncOperacion.UPDATE,
        motivoDB,
        this.motivoBajaRepo.target
      );

      return motivoDB;
    });
  }

  async removeAll() {
    await this.motivoBajaRepo.deleteAll();
  }

  getRepository(): Repository<MotivoBajas> {
    return this.motivoBajaRepo;
  }
}
