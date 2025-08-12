import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { i18n } from 'src/main';
import { NumeroBidon } from './entities/numero_bidon.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { QueryNumeroBidonDto } from './dto/query-numero-bidon.dto';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ComplexQueryBuilder } from 'src/common/classes/complex-query-builder.class';
import { buildResponse } from 'src/common/helpers/build-response';
import { LlenadorasService } from 'src/llenadoras/llenadoras.service';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';

@Injectable()
export class NumeroBidonService implements SyncableService<NumeroBidon> {
  private readonly logger = new Logger(NumeroBidonService.name);

  constructor(
    @InjectRepository(NumeroBidon)
    private readonly numeroBidonRepo: Repository<NumeroBidon>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => LlenadorasService))
    private readonly llenadorasService: LlenadorasService,
    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService
  ) {}

  async getNumeroBidonWithTransaction(
    id_llenadora: string,
    id_cabezal_llenadora: string,
    numero_items: number,
    queryRunner: QueryRunner
  ): Promise<number> {
    const anio = new Date().getFullYear();
    const id_cabezal = id_cabezal_llenadora.toUpperCase();
    const repo = queryRunner.manager.getRepository(NumeroBidon);

    let ids_cabezales: string[] = [];

    const llenadora = await this.llenadorasService.findOne(
      id_llenadora,
      queryRunner
    );
    if (!llenadora || !llenadora.cabezales) {
      throw new NotFoundException(
        i18n.errors.numeroBidon_llenadoraNoEncontrada(id_llenadora)
      );
    }

    if (llenadora.cabezales.length < 3) {
      ids_cabezales = ['A', 'B'].includes(id_cabezal)
        ? ['A', 'B']
        : [id_cabezal];
    } else {
      ids_cabezales = ['B', 'C'].includes(id_cabezal)
        ? ['B', 'C']
        : [id_cabezal];
    }

    // Paso 1: Verificar o crear registros
    let registros = await repo.find({
      where: ids_cabezales.map((id_c) => ({
        id_llenadora,
        id_cabezal_llenadora: id_c,
        anio,
      })),
    });

    const nuevos = ids_cabezales
      .filter((id_c) => !registros.find((r) => r.id_cabezal_llenadora === id_c))
      .map((id_c) =>
        repo.create({
          id_llenadora,
          id_cabezal_llenadora: id_c,
          anio,
          numero_bidon: 1,
          registro_bloqueado: 0,
        })
      );

    if (nuevos.length) {
      await repo.save(nuevos);
      registros = [...registros, ...nuevos];
    }

    // Paso 2: Validar bloqueo con reintentos durante 4 segundos
    const startTime = Date.now();
    const maxWait = 4000;
    const retryDelay = 100;

    while (true) {
      const stillBlocked = registros.some((r) => r.registro_bloqueado);

      if (!stillBlocked) break;

      if (Date.now() - startTime > maxWait) {
        throw new ConflictException(
          i18n.errors.numeroBidon_registrosBloqueados()
        );
      }

      // Esperar 100 ms antes de volver a intentar
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // Recargar registros desde la base de datos
      registros = await repo.find({
        where: ids_cabezales.map((id_c) => ({
          id_llenadora,
          id_cabezal_llenadora: id_c,
          anio,
        })),
      });
    }

    // Paso 3: Bloquear registros
    for (const r of registros) {
      r.registro_bloqueado = 1;
    }
    await repo.save(registros);

    // Paso 4: Calcular y actualizar número de bidón
    const bidonAsignado = Math.max(...registros.map((r) => r.numero_bidon));
    const nuevoNumero = bidonAsignado + numero_items;

    for (const r of registros) {
      r.numero_bidon = nuevoNumero;
      r.registro_bloqueado = 0;
    }

    await repo.save(registros);

    // Paso 5: Registrar sincronismo
    for (const r of registros) {
      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.NUMERO_BIDON,
        SyncOperacion.UPDATE,
        r,
        this.numeroBidonRepo.target
      );
    }

    return bidonAsignado;
  }

  async queryNumeroBidon(dto: QueryNumeroBidonDto) {
    const { id_llenadora, id_cabezal_llenadora, anio } = dto;
    // const tipo_cabezales = ['A', 'B'].includes(id_cabezal_llenadora) ? 'AB' : 'C';

    const registro = await this.numeroBidonRepo.findOne({
      where: {
        id_llenadora,
        id_cabezal_llenadora,
        anio,
      },
    });

    if (!registro) {
      throw new NotFoundException(i18n.errors.numeroBidon_noEncontrado());
    }

    return registro;
  }

  async queryNumeroBidonV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<NumeroBidon>(
      this.numeroBidonRepo
    );
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  getRepository(): Repository<NumeroBidon> {
    return this.numeroBidonRepo;
  }
}
