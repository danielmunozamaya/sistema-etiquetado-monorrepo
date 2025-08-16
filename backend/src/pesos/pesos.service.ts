import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { i18n } from 'src/main';
import axios from 'axios';
import { Repository, DataSource } from 'typeorm';
import { Pesos } from './entities/peso.entity';
import { ProduccionService } from 'src/produccion/produccion.service';
import { QueryPesosDto } from './dto/query-pesos.dto';
import { CreatePesosDto } from './dto/create-pesos.dto';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ComplexQueryBuilder } from 'src/common/classes/complex-query-builder.class';
import { buildResponse } from 'src/common/helpers/build-response';
import { TipoEtiqueta } from 'src/bartender/types/tipo_etiqueta.type';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { Config, ENV } from 'src/config/environment';
import { POLLING_INTERVAL_TIME_MS } from 'src/common/types/pesos.types';
import { BartenderService } from 'src/bartender/bartender.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';

@Injectable()
export class PesosService implements OnModuleInit, SyncableService<Pesos> {
  private readonly logger = new Logger(PesosService.name);
  private readonly iAmTheMainServer =
    Config[ENV].I_AM_THE_MAIN_SERVER === 'true';
  private readonly remoteApiUrl = Config[ENV].REMOTE_API_URL;
  private processingPesos = false;

  constructor(
    @InjectRepository(Pesos)
    private readonly pesosRepo: Repository<Pesos>,
    private readonly produccionService: ProduccionService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService,
    private readonly bartenderService: BartenderService
  ) {}

  onModuleInit() {
    setInterval(
      () => this.pollingPesosProduccionAutomatica(),
      POLLING_INTERVAL_TIME_MS
    );
  }

  async create(dto: CreatePesosDto) {
    let peso: Pesos | null = null;

    peso = await this.pesosRepo.findOne({
      where: {
        id_llenadora: dto.id_llenadora,
        id_cabezal_llenadora: dto.id_cabezal_llenadora,
      },
    });

    if (peso) {
      throw new ConflictException(
        i18n.errors.peso_yaExiste(dto.id_cabezal_llenadora, dto.id_llenadora)
      );
    }

    peso = this.pesosRepo.create(dto);

    return this.pesosRepo.save(peso);
  }

  async processPesos(pesos: Pesos[]) {
    this.processingPesos = true;
    for (const p of pesos) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const adjustedPeso = p.peso_plc / 10; // Se ajusta debido a que las llenadoras envían un entero con un sólo dígito de precisión decimal

        const dto = {
          tipo_etiqueta: TipoEtiqueta.AUTOMATICA,
          id_llenadora: p.id_llenadora,
          id_cabezal_llenadora: p.id_cabezal_llenadora,
          peso_neto_real: adjustedPeso,
        };

        await this.sincronismoService.localSyncTableAppendTransaction(
          queryRunner,
          SyncTabla.PESOS,
          SyncOperacion.CREATE,
          p,
          this.pesosRepo.target
        );

        const produccionRegister = await this.produccionService.create(
          dto,
          queryRunner
        );

        p.peso_plc = adjustedPeso;
        p.orden_impresion = 0;
        p.fecha_registro = new Date();
        p.registro_produccion = produccionRegister[0].id;

        const pesoUpdated = await queryRunner.manager.save(Pesos, p);

        await this.sincronismoService.localSyncTableAppendTransaction(
          queryRunner,
          SyncTabla.PESOS,
          SyncOperacion.UPDATE,
          pesoUpdated,
          this.pesosRepo.target
        );

        await queryRunner.commitTransaction();
        this.logger.debug(`✅ Registro de peso procesado: ${p.id}`);
        this.bartenderService.doPrint(
          produccionRegister,
          TipoEtiqueta.AUTOMATICA
        );
        await this.produccionService.emitEvents();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`❌ Error procesando peso ${p.id}: ${error.message}`);
      } finally {
        await queryRunner.release();
        this.processingPesos = false;
      }
    }
    this.processingPesos = false;
  }

  async removePesos(pesos: Pesos[]) {
    this.processingPesos = true;
    for (const p of pesos) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.manager.remove(Pesos, p);

        await queryRunner.commitTransaction();
        this.logger.debug(`🗑️ Peso eliminado: ${p.id}`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`❌ Error eliminando peso ${p.id}: ${error.message}`);
      } finally {
        await queryRunner.release();
        this.processingPesos = false;
      }
    }
    this.processingPesos = false;
  }

  async createProduccionAutomaticaByPollingPesos() {
    const pesos = await this.pesosRepo.find({ where: { orden_impresion: 1 } });

    if (!pesos.length) return;

    if (this.iAmTheMainServer) {
      this.logger.debug('🟢 Soy el servidor principal, procesando pesos...');
      await this.processPesos(pesos);
      return;
    }

    this.logger.debug(
      `🕒 No soy el servidor principal. Comprobando si el principal está vivo...`
    );

    try {
      const heartBitUrl = `${this.remoteApiUrl}/common/heartbit`;
      // console.log(heartBitUrl);
      const response = await axios.get(heartBitUrl, {
        timeout: 1500,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      // console.log(response.data);

      if (response.data?.alive === true) {
        this.logger.debug(
          '🫀 El servidor remoto está vivo. Eliminando pesos...'
        );
        await this.removePesos(pesos);
      } else {
        this.logger.warn(
          '⚠️ Respuesta inesperada del servidor remoto. Asumiendo caída...'
        );
        await this.processPesos(pesos);
      }
    } catch (error) {
      this.logger.error(
        `❌ Error consultando al servidor remoto: ${error.message}`
      );
      await this.processPesos(pesos);
    }
  }

  async pollingPesosProduccionAutomatica() {
    try {
      if (this.processingPesos) {
        this.logger.warn(`❗ Polling cancelado: aún hay pesos procesándose.`);
        return;
      }
      await this.createProduccionAutomaticaByPollingPesos();
    } catch (error) {
      // console.log(error);
      this.logger.error(
        `Error al ejecutar polling de la función createProduccionAutomaticaByPollingPesos: ${error.message}`
      );
    }
  }

  async queryPesos(dto: QueryPesosDto) {
    const peso = await this.pesosRepo.findOneBy({
      id_llenadora: dto.id_llenadora,
      id_cabezal_llenadora: dto.id_cabezal_llenadora,
    });

    if (!peso) {
      throw new NotFoundException(i18n.errors.peso_noEncontrado());
    }

    return peso;
  }

  async queryPesosV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<Pesos>(this.pesosRepo);
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  async queryPesosV3() {
    const data = await this.pesosRepo.query(`
      SELECT p.*
      FROM pesos p
      INNER JOIN (
        SELECT id_llenadora, id_cabezal_llenadora, MAX(fecha_registro) AS fecha_max
        FROM pesos
        GROUP BY id_llenadora, id_cabezal_llenadora
      ) latest
      ON p.id_llenadora = latest.id_llenadora
      AND p.id_cabezal_llenadora = latest.id_cabezal_llenadora
      AND p.fecha_registro = latest.fecha_max
    `);
    return data;
  }

  getRepository(): Repository<Pesos> {
    return this.pesosRepo;
  }
}
