import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { i18n } from 'src/main';
import { CreateProduccionDto } from './dto/create-produccion.dto';
import { UpdateProduccionDto } from './dto/update-produccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Produccion } from './entities/produccion.entity';
import { Repository, DataSource, DeepPartial, QueryRunner } from 'typeorm';
import { LlenadorasService } from 'src/llenadoras/llenadoras.service';
import { AsociacionProduccionService } from 'src/asociacion-produccion/asociacion-produccion.service';
// import { PresentacionesService } from 'src/presentaciones/presentaciones.service';
// import { PesosService } from 'src/pesos/pesos.service';
import { MotivoBajasService } from '../motivo-bajas/motivo-bajas.service';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterProduccionDto } from './dto/filter-produccion.dto';
import { NumeroBidonService } from 'src/numero_bidon/numero_bidon.service';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { Paginator } from 'src/common/classes/paginator.class';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { ComplexQueryBuilder } from 'src/common/classes/complex-query-builder.class';
import { buildResponse } from 'src/common/helpers/build-response';
import { WebsocketsService } from 'src/websockets/websockets.service';
import {
  HomeServiceMethod,
  ServiceType,
} from 'src/websockets/types/websockets-events.types';
import { BartenderService } from 'src/bartender/bartender.service';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { TransactionalService } from 'src/common/services/transactional.service';
import { PaginationDefaultValues } from 'src/common/types/pagination.types';
import { CreateManualProduccionDto } from './dto/create-manual-produccion.dto';
import { TipoEtiqueta } from 'src/bartender/types/tipo_etiqueta.type';

@Injectable()
export class ProduccionService
  extends TransactionalService
  implements SyncableService<Produccion>
{
  constructor(
    @InjectRepository(Produccion)
    private readonly produccionRepo: Repository<Produccion>,
    dataSource: DataSource,

    @Inject(forwardRef(() => LlenadorasService))
    private readonly llenadorasService: LlenadorasService,
    @Inject(forwardRef(() => AsociacionProduccionService))
    private readonly asociacionService: AsociacionProduccionService,
    private readonly motivoBajasService: MotivoBajasService,
    private readonly numeroBidonService: NumeroBidonService,
    // private readonly presentacionesService: PresentacionesService,
    // private readonly pesosService: PesosService,
    private readonly websocketsService: WebsocketsService,
    private readonly bartenderService: BartenderService,
    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService
  ) {
    super(dataSource);
  }

  calculateCode(date: Date) {
    const es29Febrero = date.getDate() === 29 && date.getMonth() === 1;
    if (es29Febrero) return 366;

    return parseInt(
      Math.floor(
        (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
          86400000
      ).toString()
    );
  }

  parseDateToSQLServerFormat(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async create(dto: CreateProduccionDto, queryRunner: QueryRunner) {
    const repo = queryRunner.manager.getRepository(Produccion);

    const {
      tipo_etiqueta,
      id_llenadora,
      id_cabezal_llenadora,
      peso_neto_real,
      titulo_1,
      valor_1,
      titulo_2,
      valor_2,
      numero_items = 1,
    } = dto;

    const llenadora = await this.llenadorasService.findOne(
      id_llenadora,
      queryRunner
    );
    const cabezal = llenadora.cabezales.find(
      (c) => c.id_cabezal === id_cabezal_llenadora
    );
    if (!cabezal) {
      throw new NotFoundException(
        i18n.errors.produccion_cabezalNoPerteneceLlenadora(
          id_cabezal_llenadora,
          id_llenadora
        )
      );
    }

    if (
      (titulo_1 && !valor_1) ||
      (!titulo_1 && valor_1) ||
      (titulo_2 && !valor_2) ||
      (!titulo_2 && valor_2)
    ) {
      throw new ConflictException(
        i18n.errors.produccion_tituloValorAdicional()
      );
    }

    const asociacion = await this.asociacionService.findOne(
      id_llenadora + id_cabezal_llenadora,
      false,
      queryRunner
    );
    if (
      !asociacion.id_producto ||
      !asociacion.familia_producto ||
      !asociacion.codigo_ean ||
      !asociacion.ruta_etiqueta
    ) {
      throw new ConflictException(
        i18n.errors.produccion_asociacionDatosIncompletos()
      );
    }

    const ean = asociacion.ean;

    const no_bidon =
      await this.numeroBidonService.getNumeroBidonWithTransaction(
        id_llenadora,
        id_cabezal_llenadora,
        numero_items,
        queryRunner
      );

    const fechaActual = new Date();
    const hora = fechaActual.toTimeString().substring(0, 5);
    const code = this.calculateCode(fechaActual);

    const fecha_caducidad = new Date(fechaActual);
    fecha_caducidad.setDate(
      fecha_caducidad.getDate() + Number(ean.dias_best_before)
    );

    const neto_real = peso_neto_real ?? ean.presentacion.peso_neto;
    let peso_neto_etiqueta = +neto_real;
    if (
      peso_neto_etiqueta <
      +ean.presentacion.peso_neto - +asociacion.limite_llenado
    ) {
      peso_neto_etiqueta =
        +ean.presentacion.peso_neto - +asociacion.limite_llenado;
    }
    if (
      peso_neto_etiqueta >
      +ean.presentacion.peso_neto + +asociacion.limite_llenado
    ) {
      peso_neto_etiqueta =
        +ean.presentacion.peso_neto + +asociacion.limite_llenado;
    }
    // peso_neto_etiqueta = +neto_real + +asociacion.limite_llenado;
    const peso_bruto_etiqueta =
      +peso_neto_etiqueta +
      (+ean.presentacion.peso_bruto - +ean.presentacion.peso_neto);

    const año = fechaActual.getFullYear().toString().slice(-2);
    const codeStr = code.toString().padStart(3, '0');
    const horaStr = hora.split(':')[0];
    const llenadoraNum = id_llenadora.padStart(2, '0');
    const cabezalNum = id_cabezal_llenadora.toUpperCase().charCodeAt(0) - 64;
    const tipoEtiquetaStr = tipo_etiqueta.toString();
    const no_lote = `${año}${codeStr}${horaStr}${llenadoraNum}`;

    const producciones: Produccion[] = [];

    for (let i = 0; i < numero_items; i++) {
      const bidonActual = no_bidon + i;
      const bidonStr = bidonActual.toString().slice(0, 6).padStart(6, '0');

      const codigoEanStr = (asociacion.codigo_ean ?? '').toString();
      const eanDigits = codigoEanStr.substring(9, 12).padEnd(3, '0');

      const raiz = `${cabezalNum}${eanDigits}${codeStr}${horaStr}${llenadoraNum}${bidonStr}`;
      const suma = raiz
        .split('')
        .reduce(
          (acc, val, idx) => acc + Number(val) * (idx % 2 === 0 ? 3 : 1),
          0
        );
      const siguienteMultiplo10 = Math.ceil(suma / 10) * 10;
      const digito_control = siguienteMultiplo10 - suma;
      const no_matricula = raiz + `${digito_control}`;

      const produccion = repo.create({
        tipo_etiqueta,
        no_bidon: bidonActual,
        digito_control,
        no_matricula,
        no_lote,
        id_llenadora,
        id_cabezal_llenadora,
        uuid_cabezal: cabezal.id,
        id_producto: asociacion.id_producto,
        familia_producto: asociacion.familia_producto,
        codigo_ean: asociacion.codigo_ean,
        fecha_produccion: this.parseDateToSQLServerFormat(fechaActual),
        hora_produccion: hora,
        fecha_caducidad: this.parseDateToSQLServerFormat(fecha_caducidad),
        code,
        peso_neto_real: neto_real,
        peso_neto_etiqueta,
        peso_bruto_etiqueta,
        titulo_1: titulo_1 ?? null,
        valor_1: valor_1 ?? null,
        titulo_2: titulo_2 ?? null,
        valor_2: valor_2 ?? null,
      } as DeepPartial<Produccion>);

      producciones.push(produccion);
    }

    const produccionesDB = await repo.save(producciones);

    // Registro de sincronismo dentro de la transacción
    for (const produccionRegister of produccionesDB)
      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.PRODUCCION,
        SyncOperacion.CREATE,
        produccionRegister,
        this.produccionRepo.target
      );

    return produccionesDB;
  }

  calcularFechaYHoraConIntervalo(
    fechaProduccion: string, // 'YYYY-MM-DD'
    horaProduccion: string, // 'HH:MM'
    intervaloMinutos: number,
    index: number
  ): { fecha_produccion_final: string; hora_produccion_final: string } {
    const [year, month, day] = fechaProduccion.split('-').map(Number);
    const [hour, minute] = horaProduccion.split(':').map(Number);

    const fecha = new Date(year, month - 1, day, hour, minute);

    const minutosTotales = intervaloMinutos * index;
    fecha.setMinutes(fecha.getMinutes() + minutosTotales);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const fechaResultado = `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
    const horaResultado = `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;

    return {
      fecha_produccion_final: fechaResultado,
      hora_produccion_final: horaResultado,
    };
  }

  async createManual(dto: CreateManualProduccionDto, queryRunner: QueryRunner) {
    const repo = queryRunner.manager.getRepository(Produccion);

    const tipo_etiqueta = TipoEtiqueta.MANUAL;

    const {
      no_matricula,
      no_lote,
      id_llenadora,
      id_cabezal_llenadora,
      id_producto,
      familia_producto,
      codigo_ean,
      fecha_produccion,
      hora_produccion,
      intervalo_minutos,
      fecha_caducidad,
      code,
      peso_neto,
      peso_bruto,
      sscc,
      titulo_1,
      valor_1,
      titulo_2,
      valor_2,
      numero_etiquetas,
    } = dto;

    // return dto;

    const llenadora = await this.llenadorasService.findOne(
      id_llenadora,
      queryRunner
    );
    const cabezal = llenadora.cabezales.find(
      (c) => c.id_cabezal === id_cabezal_llenadora
    );
    if (!cabezal) {
      throw new NotFoundException(
        i18n.errors.produccion_cabezalNoPerteneceLlenadora(
          id_cabezal_llenadora,
          id_llenadora
        )
      );
    }

    if (
      (titulo_1 && !valor_1) ||
      (!titulo_1 && valor_1) ||
      (titulo_2 && !valor_2) ||
      (!titulo_2 && valor_2)
    ) {
      throw new ConflictException(
        i18n.errors.produccion_tituloValorAdicional()
      );
    }

    const asociacion = await this.asociacionService.findOne(
      id_llenadora + id_cabezal_llenadora,
      false,
      queryRunner
    );
    if (!asociacion.ruta_etiqueta) {
      throw new ConflictException(
        i18n.errors.produccion_rutaEtiquetaNoAsignada()
      );
    }

    const no_bidon =
      await this.numeroBidonService.getNumeroBidonWithTransaction(
        id_llenadora,
        id_cabezal_llenadora,
        numero_etiquetas,
        queryRunner
      );

    const producciones: Produccion[] = [];

    for (let i = 0; i < numero_etiquetas; i++) {
      const { fecha_produccion_final, hora_produccion_final } =
        this.calcularFechaYHoraConIntervalo(
          fecha_produccion,
          hora_produccion,
          intervalo_minutos,
          i
        );

      const bidonActual = no_bidon + i;

      const produccion = repo.create({
        tipo_etiqueta,
        no_bidon: bidonActual,
        digito_control: Number(no_matricula[no_matricula.length - 1]),
        no_matricula,
        no_lote,
        id_llenadora,
        id_cabezal_llenadora,
        uuid_cabezal: cabezal.id,
        id_producto,
        familia_producto,
        codigo_ean,
        fecha_produccion: fecha_produccion_final,
        hora_produccion: hora_produccion_final,
        fecha_caducidad,
        code,
        sscc: sscc ?? null,
        peso_neto_real: peso_neto,
        peso_neto_etiqueta: peso_neto,
        peso_bruto_etiqueta: peso_bruto,
        titulo_1: titulo_1 ?? null,
        valor_1: valor_1 ?? null,
        titulo_2: titulo_2 ?? null,
        valor_2: valor_2 ?? null,
      } as DeepPartial<Produccion>);

      producciones.push(produccion);
    }

    const produccionesDB = await repo.save(producciones);

    // Registro de sincronismo dentro de la transacción
    for (const produccionRegister of produccionesDB)
      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.PRODUCCION,
        SyncOperacion.CREATE,
        produccionRegister,
        this.produccionRepo.target
      );

    return produccionesDB;
  }

  async emitEvents() {
    this.websocketsService.emitWsEvent({
      type: ServiceType.HOME,
      payload: { method: HomeServiceMethod.GET_ASOCIACIONES },
    });
    this.websocketsService.emitWsEvent({
      type: ServiceType.HOME,
      payload: { method: HomeServiceMethod.GET_NUMERO_BIDON },
    });
    this.websocketsService.emitWsEvent({
      type: ServiceType.HOME,
      payload: { method: HomeServiceMethod.GET_PESOS },
    });
  }

  async createWithTransaction(
    dto: CreateProduccionDto,
    userUuid: string
  ): Promise<Produccion[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const producciones = await this.create(dto, queryRunner);

      await queryRunner.commitTransaction();
      this.bartenderService.doPrint(producciones, dto.tipo_etiqueta, userUuid);
      await this.emitEvents();
      return producciones;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createManualWithTransaction(
    dto: CreateManualProduccionDto,
    userUuid: string
  ): Promise<Produccion[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const producciones = await this.createManual(dto, queryRunner);

      await queryRunner.commitTransaction();
      this.bartenderService.doPrint(
        producciones,
        TipoEtiqueta.MANUAL,
        userUuid
      );
      return producciones;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    paginationDto: PaginationDto
  ): Promise<Produccion[] | PaginationResponse<Produccion>> {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = false,
    } = paginationDto;

    const relations = {
      motivoBaja: true,
      bajaUsuario: true,
    };

    if (!paginated_response) {
      return this.produccionRepo.find({
        take: limit,
        skip: offset,
        relations,
      });
    }

    const paginator = new Paginator(this.produccionRepo);
    return paginator.paginateRepository(paginationDto, { relations });
  }

  async findOne(id: string, queryRunner?: QueryRunner) {
    // if (!isUUID(id)) {
    //   throw new BadRequestException('El ID debe ser un UUID válido');
    // }

    const repo = queryRunner
      ? queryRunner.manager.getRepository(Produccion)
      : this.produccionRepo;

    const produccion = await repo.findOneBy({ id });

    if (!produccion) {
      throw new NotFoundException(i18n.errors.produccion_noEncontrada(id));
    }

    return produccion;
  }

  async updateWithTransaction(
    id: string,
    dto: UpdateProduccionDto,
    usuario: any
  ) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Produccion);

      const produccion = await this.findOne(id, queryRunner);
      if (!produccion) {
        throw new NotFoundException(i18n.errors.produccion_noEncontrada(id));
      }

      const motivo = await this.motivoBajasService.findOne(
        dto.codigo_baja,
        queryRunner
      );
      if (!motivo) {
        throw new NotFoundException(
          i18n.errors.produccion_motivoBajaNoEncontrado(dto.codigo_baja)
        );
      }

      produccion.estado = 0;
      produccion.motivo_baja = motivo.id;
      produccion.baja_fecha = new Date();
      produccion.baja_usuario = usuario.uuid;

      const produccionDB = await repo.save(produccion);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.PRODUCCION,
        SyncOperacion.UPDATE,
        produccionDB,
        this.produccionRepo.target
      );

      return produccionDB;
    });
  }

  remove(id: number) {
    return `This action removes a #${id} produccion`;
  }

  async filter(dto: FilterProduccionDto, paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
      paginated_response = false,
    } = paginationDto;

    const {
      id_llenadora,
      id_cabezal_llenadora,
      estado,
      registrado,
      tipo_etiqueta,
      fecha_desde,
      hora_desde,
      fecha_hasta,
      hora_hasta,
    } = dto;

    const query = this.produccionRepo
      .createQueryBuilder('produccion')
      .leftJoinAndSelect('produccion.motivoBaja', 'motivoBaja')
      .leftJoinAndSelect('produccion.bajaUsuario', 'bajaUsuario');

    if (id_llenadora)
      query.andWhere('produccion.id_llenadora = :id_llenadora', {
        id_llenadora,
      });

    if (id_cabezal_llenadora)
      query.andWhere(
        'produccion.id_cabezal_llenadora = :id_cabezal_llenadora',
        {
          id_cabezal_llenadora,
        }
      );

    if (estado !== undefined)
      query.andWhere('produccion.estado = :estado', { estado });

    if (registrado !== undefined)
      query.andWhere('produccion.registrado = :registrado', { registrado });

    if (tipo_etiqueta !== undefined)
      query.andWhere('produccion.tipo_etiqueta = :tipo_etiqueta', {
        tipo_etiqueta,
      });

    if (fecha_desde && fecha_hasta) {
      if (fecha_desde > fecha_hasta) {
        throw new BadRequestException(
          i18n.errors.produccion_fechaInicialPosteriorFinal()
        );
      }
      query.andWhere(
        'produccion.fecha_produccion BETWEEN :fDesde AND :fHasta',
        {
          fDesde: fecha_desde,
          fHasta: fecha_hasta,
        }
      );
    } else if (fecha_desde) {
      query.andWhere('produccion.fecha_produccion >= :fDesde', {
        fDesde: fecha_desde,
      });
    } else if (fecha_hasta) {
      query.andWhere('produccion.fecha_produccion <= :fHasta', {
        fHasta: fecha_hasta,
      });
    }

    const normalizarHora = (hora: string) => {
      const [h, m] = hora.split(':');
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
    };

    const horaDesde = hora_desde ? normalizarHora(hora_desde) : undefined;
    const horaHasta = hora_hasta ? normalizarHora(hora_hasta) : undefined;

    if (horaDesde && horaHasta) {
      if (horaDesde > horaHasta) {
        throw new BadRequestException(
          i18n.errors.produccion_horaInicialPosteriorFinal()
        );
      }
      query.andWhere('produccion.hora_produccion BETWEEN :hDesde AND :hHasta', {
        hDesde: horaDesde,
        hHasta: horaHasta,
      });
    } else if (horaDesde) {
      query.andWhere('produccion.hora_produccion >= :hDesde', {
        hDesde: horaDesde,
      });
    } else if (horaHasta) {
      query.andWhere('produccion.hora_produccion <= :hHasta', {
        hHasta: horaHasta,
      });
    }

    query
      .orderBy('produccion.fecha_produccion', 'ASC')
      .addOrderBy('produccion.hora_produccion', 'ASC');

    if (!paginated_response) {
      return query.getMany();
    }

    const paginator = new Paginator(this.produccionRepo);
    return paginator.paginateQueryBuilder(query, paginationDto);
  }

  async queryProduccionV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<Produccion>(
      this.produccionRepo
    );
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  getRepository(): Repository<Produccion> {
    return this.produccionRepo;
  }
}
