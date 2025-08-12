import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, QueryRunner, Repository } from 'typeorm';
import { i18n } from 'src/main';
import { validate as isUUID } from 'uuid';

import { CreateLlenadoraDto } from './dto/create-llenadora.dto';
import { UpdateLlenadoraDto } from './dto/update-llenadora.dto';
import { Llenadoras } from './entities/llenadora.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Paginator } from 'src/common/classes/paginator.class';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { ComplexQueryBuilder } from 'src/common/classes/complex-query-builder.class';
import { buildResponse } from 'src/common/helpers/build-response';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { CabezalesService } from '../cabezales/cabezales.service';
import { AsociacionProduccionService } from 'src/asociacion-produccion/asociacion-produccion.service';
import { CreateLlenadoraCabezalesAndAsociacionesDTO } from './dto/create-all.dto';
import { CreateAsociacionProduccionDto } from 'src/asociacion-produccion/dto/create-asociacion-produccion.dto';
import { Cabezales } from 'src/cabezales/entities/cabezal.entity';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { TransactionalService } from 'src/common/services/transactional.service';
import { PaginationDefaultValues } from 'src/common/types/pagination.types';

@Injectable()
export class LlenadorasService
  extends TransactionalService
  implements SyncableService<Llenadoras>
{
  constructor(
    @InjectRepository(Llenadoras)
    private readonly llenadorasRepo: Repository<Llenadoras>,
    private readonly sincronismoService: SincronismoService,
    private readonly cabezalesService: CabezalesService,
    dataSource: DataSource,
    @Inject(forwardRef(() => AsociacionProduccionService))
    private readonly asociacionService: AsociacionProduccionService
  ) {
    super(dataSource);
  }

  async createWithTransaction(createLlenadoraDto: CreateLlenadoraDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Llenadoras);

      const existingLlenadora = await repo
        .createQueryBuilder('llenadora')
        .where(`UPPER(id_llenadora) = :id_llenadora`, {
          id_llenadora: createLlenadoraDto.id_llenadora.toUpperCase(),
        })
        .orWhere(`nombre_llenadora = :nombre_llenadora`, {
          nombre_llenadora: createLlenadoraDto.nombre_llenadora.toUpperCase(),
        })
        .getOne();

      if (existingLlenadora) {
        throw new ConflictException(
          i18n.errors.llenadora_yaExiste()
        );
      }

      const llenadoraObject = repo.create(createLlenadoraDto);
      const llenadoraDB = await repo.save(llenadoraObject);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.LLENADORAS,
        SyncOperacion.CREATE,
        llenadoraDB,
        this.llenadorasRepo.target
      );

      return llenadoraDB;
    });
  }

  async createAllWithTransaction(
    createDto: CreateLlenadoraCabezalesAndAsociacionesDTO
  ) {
    return this.executeTransaction(async (queryRunner) => {
      const cabezalesRepo = this.cabezalesService.getRepository();
      const asociacionesRepo = this.asociacionService.getRepository();

      const cabezalesDB: Cabezales[] = [];
      const asociacionesDB: AsociacionProduccion[] = [];

      if (
        !createDto.cabezales ||
        (createDto.cabezales.length !== 2 && createDto.cabezales.length !== 3)
      ) {
        throw new ConflictException(
          i18n.errors.llenadora_cabezalesCantidadIncorrecta()
        );
      }

      const idExistente = await this.llenadorasRepo.findOne({
        where: { id_llenadora: createDto.id_llenadora },
      });

      if (idExistente) {
        throw new ConflictException(
          i18n.errors.llenadora_idYaExiste(createDto.id_llenadora)
        );
      }

      const nombreExistente = await this.llenadorasRepo.findOne({
        where: { nombre_llenadora: createDto.nombre_llenadora },
      });

      if (nombreExistente) {
        throw new ConflictException(
          i18n.errors.llenadora_nombreYaExiste(createDto.nombre_llenadora)
        );
      }

      const nuevaLlenadora = this.llenadorasRepo.create({
        ...createDto,
        visible: createDto.visible ?? true,
      });

      const llenadoraDB = await queryRunner.manager.save(
        this.llenadorasRepo.target,
        nuevaLlenadora
      );

      for (const cabezalDto of createDto.cabezales) {
        if (createDto.id_llenadora !== cabezalDto.id_llenadora) {
          throw new ConflictException(
            i18n.errors.llenadora_idCabezalNoCoincide()
          );
        }

        const cabezalExistente = await queryRunner.manager.findOne(
          cabezalesRepo.target,
          {
            where: {
              id_llenadora: cabezalDto.id_llenadora,
              id_cabezal: cabezalDto.id_cabezal,
            },
          }
        );

        if (cabezalExistente) {
          throw new ConflictException(
            i18n.errors.llenadora_cabezalYaExiste(cabezalDto.id_cabezal, cabezalDto.id_llenadora)
          );
        }

        const nombreCabezalExistente = await queryRunner.manager.findOne(
          cabezalesRepo.target,
          {
            where: {
              nombre_cabezal: cabezalDto.nombre_cabezal,
            },
          }
        );

        if (nombreCabezalExistente) {
          throw new ConflictException(
            i18n.errors.llenadora_nombreCabezalYaExiste(cabezalDto.nombre_cabezal)
          );
        }

        const rutaExistente = await queryRunner.manager.findOne(
          cabezalesRepo.target,
          {
            where: {
              ruta_impresion: cabezalDto.ruta_impresion,
            },
          }
        );

        if (rutaExistente) {
          throw new ConflictException(
            i18n.errors.llenadora_rutaCabezalYaExiste(cabezalDto.ruta_impresion)
          );
        }

        const nuevoCabezal = cabezalesRepo.create({
          ...cabezalDto,
          id_llenadora: createDto.id_llenadora,
          visible: true,
        });

        const cabezalGuardado = await queryRunner.manager.save(
          cabezalesRepo.target,
          nuevoCabezal
        );

        cabezalesDB.push(cabezalGuardado);

        const asociacionExistente = await queryRunner.manager.findOne(
          asociacionesRepo.target,
          {
            where: {
              id_llenadora: createDto.id_llenadora,
              id_cabezal_llenadora: cabezalDto.id_cabezal,
            },
          }
        );

        if (asociacionExistente) {
          throw new ConflictException(
            i18n.errors.llenadora_asociacionYaExiste(createDto.id_llenadora, cabezalDto.id_cabezal)
          );
        }

        const nuevaAsociacion: CreateAsociacionProduccionDto = {
          id_llenadora: createDto.id_llenadora,
          id_cabezal_llenadora: cabezalDto.id_cabezal,
          uuid_cabezal: cabezalGuardado.id,
        };

        const asociacionGuardada = await queryRunner.manager.save(
          asociacionesRepo.target,
          nuevaAsociacion
        );

        asociacionesDB.push(asociacionGuardada);
      }

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.LLENADORAS,
        SyncOperacion.CREATE,
        nuevaLlenadora,
        this.llenadorasRepo.target
      );

      for (const cabezal of cabezalesDB) {
        await this.sincronismoService.localSyncTableAppendTransaction(
          queryRunner,
          SyncTabla.CABEZALES,
          SyncOperacion.CREATE,
          cabezal,
          this.cabezalesService.getRepository().target
        );
      }

      for (const asociacion of asociacionesDB) {
        await this.sincronismoService.localSyncTableAppendTransaction(
          queryRunner,
          SyncTabla.ASOCIACION_PRODUCCION,
          SyncOperacion.CREATE,
          asociacion,
          this.asociacionService.getRepository().target
        );
      }

      return llenadoraDB;
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = 0,
    } = paginationDto;
    const where = { visible: true };

    if (!paginated_response) {
      const llenadoras = await this.llenadorasRepo.find({
        where: { visible: true },
        take: limit,
        skip: offset,
      });

      return llenadoras;
    }

    const paginator = new Paginator(this.llenadorasRepo);
    return paginator.paginateRepository(paginationDto, { where });
  }

  async count() {
    return this.llenadorasRepo.count();
  }

  async findAllSlim(paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = 0,
    } = paginationDto;

    const llenadoras = await this.llenadorasRepo.find({
      where: { visible: true },
      select: { id_llenadora: true, nombre_llenadora: true },
      take: limit,
      skip: offset,
    });

    return llenadoras;
  }

  async findOne(term: string, queryRunner?: QueryRunner): Promise<Llenadoras> {
    const manager = queryRunner?.manager ?? this.llenadorasRepo.manager;

    let llenadora: Llenadoras | null = null;

    if (isUUID(term)) {
      llenadora = await manager.findOne(Llenadoras, {
        where: { id: term },
        relations: { cabezales: true },
      });
    }

    if (!llenadora && !isUUID(term)) {
      llenadora = await manager
        .createQueryBuilder(Llenadoras, 'llenadora')
        .leftJoinAndSelect('llenadora.cabezales', 'cabezales')
        .where('UPPER(llenadora.id_llenadora) = :id_llenadora', {
          id_llenadora: term.toUpperCase(),
        })
        .orWhere('llenadora.nombre_llenadora = :nombre_llenadora', {
          nombre_llenadora: term.toUpperCase(),
        })
        .getOne();
    }

    if (!llenadora) {
      throw new NotFoundException(i18n.errors.llenadora_noEncontrada(term));
    }

    return llenadora;
  }

  async queryLlenadorasV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<Llenadoras>(
      this.llenadorasRepo
    );
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  async updateWithTransaction(
    term: string,
    updateLlenadoraDto: UpdateLlenadoraDto
  ) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Llenadoras);

      const llenadora = await this.findOne(term, queryRunner);

      if (llenadora.nombre_llenadora === updateLlenadoraDto.nombre_llenadora)
        throw new ConflictException(
          i18n.errors.llenadora_nombreYaEnUso(updateLlenadoraDto.nombre_llenadora)
        );

      const nombreEnUso = await repo.findOne({
        where: {
          nombre_llenadora: updateLlenadoraDto.nombre_llenadora,
        },
      });

      if (nombreEnUso && nombreEnUso.id !== llenadora.id) {
        throw new ConflictException(
          i18n.errors.llenadora_nombreYaExiste(updateLlenadoraDto.nombre_llenadora)
        );
      }

      llenadora.nombre_llenadora = updateLlenadoraDto.nombre_llenadora;

      const llenadoraDB = await repo.save(llenadora);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.LLENADORAS,
        SyncOperacion.UPDATE,
        llenadoraDB,
        this.llenadorasRepo.target
      );

      return llenadoraDB;
    });
  }

  async removeWithTransaction(id: string) {
    return this.executeTransaction(async (queryRunner) => {
      const cabezalesRepo = this.cabezalesService.getRepository();
      const asociacionesRepo = this.asociacionService.getRepository();

      const repo = queryRunner.manager.getRepository(Llenadoras);
      const llenadora = await this.findOne(id, queryRunner);

      if (!llenadora.visible) {
        throw new ConflictException(
          i18n.errors.llenadora_yaEliminada(llenadora.id_llenadora)
        );
      }

      if (llenadora.etiquetado_auto) {
        throw new ConflictException(
          i18n.errors.llenadora_noSePuedeEliminarAuto(llenadora.id_llenadora)
        );
      }

      const asociacionesEliminadas: AsociacionProduccion[] = [];

      llenadora.visible = false;
      await repo.save(llenadora);

      for (const cabezal of llenadora.cabezales) {
        cabezal.visible = false;

        await queryRunner.manager.save(cabezalesRepo.target, cabezal);

        const asociacion = await queryRunner.manager.findOne(
          asociacionesRepo.target,
          {
            where: {
              id_llenadora: llenadora.id_llenadora,
              id_cabezal_llenadora: cabezal.id_cabezal,
            },
          }
        );

        if (asociacion) {
          asociacionesEliminadas.push(JSON.parse(JSON.stringify(asociacion)));
          await queryRunner.manager.remove(asociacionesRepo.target, asociacion);
        }
      }

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.LLENADORAS,
        SyncOperacion.UPDATE,
        llenadora,
        this.llenadorasRepo.target
      );

      for (const cabezal of llenadora.cabezales) {
        await this.sincronismoService.localSyncTableAppendTransaction(
          queryRunner,
          SyncTabla.CABEZALES,
          SyncOperacion.UPDATE,
          cabezal,
          cabezalesRepo.target
        );
      }

      for (const asociacion of asociacionesEliminadas) {
        await this.sincronismoService.localSyncTableAppendTransaction(
          queryRunner,
          SyncTabla.ASOCIACION_PRODUCCION,
          SyncOperacion.DELETE,
          asociacion,
          asociacionesRepo.target
        );
      }

      return llenadora;
    });
  }

  async removeAll() {
    await this.llenadorasRepo.deleteAll();
  }

  getRepository(): Repository<Llenadoras> {
    return this.llenadorasRepo;
  }
}
