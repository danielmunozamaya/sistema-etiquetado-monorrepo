import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, QueryRunner, Repository } from 'typeorm';
import { i18n } from 'src/main';

import { AsociacionProduccion } from './entities/asociacion-produccion.entity';
import { CreateAsociacionProduccionDto } from './dto/create-asociacion-produccion.dto';
import { UpdateAsociacionProduccionDto } from './dto/update-asociacion-produccion.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { LlenadorasService } from 'src/llenadoras/llenadoras.service';
import { ProductosService } from 'src/productos/productos.service';
import { EanService } from 'src/ean/ean.service';
import { isUUID } from 'class-validator';
import { Paginator } from 'src/common/classes/paginator.class';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { SyncTabla, UserRole } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { Productos } from 'src/productos/entities/producto.entity';
import { Ean } from 'src/ean/entities/ean.entity';
import { CabezalesService } from 'src/cabezales/cabezales.service';
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
import { LlenadorasPermitidasCabecera } from 'src/common/types/roles.types';
import { RolesService } from 'src/roles/roles.service';
import { PaginationDefaultValues } from 'src/common/types/pagination.types';

@Injectable()
export class AsociacionProduccionService
  extends TransactionalService
  implements SyncableService<AsociacionProduccion>
{
  constructor(
    @InjectRepository(AsociacionProduccion)
    private readonly asociacionRepo: Repository<AsociacionProduccion>,
    dataSource: DataSource,

    @Inject(forwardRef(() => LlenadorasService))
    private readonly llenadorasService: LlenadorasService,
    @Inject(forwardRef(() => CabezalesService))
    private readonly cabezalesService: CabezalesService,
    @Inject(forwardRef(() => ProductosService))
    private readonly productosService: ProductosService,
    @Inject(forwardRef(() => EanService))
    private readonly eanService: EanService,
    private readonly websocketsService: WebsocketsService,
    @Inject(forwardRef(() => BartenderService))
    private readonly bartenderService: BartenderService,
    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesServide: RolesService
  ) {
    super(dataSource);
  }

  async createWithTransaction(dto: CreateAsociacionProduccionDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(AsociacionProduccion);

      const exists = await repo.exists({
        where: {
          id_llenadora: dto.id_llenadora,
          id_cabezal_llenadora: dto.id_cabezal_llenadora,
        },
      });

      if (exists) {
        throw new ConflictException(
          i18n.errors.asociacionYaExiste(
            dto.id_cabezal_llenadora,
            dto.id_llenadora
          )
        );
      }

      const llenadora = await this.llenadorasService.findOne(
        dto.id_llenadora,
        queryRunner
      );
      const cabezales = llenadora.cabezales;
      const cabezal = cabezales.find(
        (c) => c.id_cabezal === dto.id_cabezal_llenadora
      );

      if (!cabezal) {
        throw new NotFoundException(
          i18n.errors.cabezalNoExiste(
            dto.id_cabezal_llenadora,
            dto.id_llenadora
          )
        );
      }

      let producto: Productos | null = null;
      let ean: Ean | null = null;

      if (dto.id_producto && dto.codigo_ean) {
        producto = await this.productosService.findOne(
          dto.id_producto,
          queryRunner
        );
        ean = await this.eanService.findOne(dto.codigo_ean, queryRunner);

        if (ean.id_producto !== producto.id_producto) {
          throw new ConflictException(
            i18n.errors.eanNoAsociadoProducto(dto.codigo_ean, dto.id_producto)
          );
        }
      } else if (dto.id_producto && !dto.codigo_ean) {
        throw new BadRequestException(i18n.errors.productoSinEan());
      } else if (!dto.id_producto && dto.codigo_ean) {
        throw new BadRequestException(i18n.errors.eanSinProducto());
      }

      const asociacion = repo.create({
        id_llenadora: dto.id_llenadora,
        id_cabezal_llenadora: dto.id_cabezal_llenadora,
        uuid_cabezal: cabezal.id,
        id_producto: producto?.id_producto ?? null,
        familia_producto: producto?.familia_producto ?? null,
        codigo_ean: ean?.codigo_ean ?? null,
        limite_llenado: dto.limite_llenado ?? 3,
        ruta_etiqueta: dto.ruta_etiqueta ?? null,
      });

      if (dto.ruta_etiqueta) {
        if (!this.bartenderService.rutaEtiquetaIsOk(dto.ruta_etiqueta)) {
          throw new NotFoundException(
            i18n.errors.rutaEtiquetaNoOk(dto.ruta_etiqueta)
          );
        }
        asociacion.ruta_etiqueta = dto.ruta_etiqueta;
      }

      const asociacionDB = await repo.save(asociacion);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.ASOCIACION_PRODUCCION,
        SyncOperacion.CREATE,
        asociacionDB,
        this.asociacionRepo.target
      );

      return asociacionDB;
    });
  }

  async findAll(paginationDto: PaginationDto, userRole: UserRole) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
    } = paginationDto;

    const asociaciones = await this.asociacionRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.llenadora', 'llenadora')
      .leftJoinAndSelect('llenadora.cabezales', 'cabezales')
      .leftJoinAndSelect('a.cabezal', 'cabezal')
      .leftJoinAndMapOne(
        'cabezal.peso',
        'pesos',
        'peso',
        'peso.id_llenadora = cabezal.id_llenadora AND peso.id_cabezal_llenadora = cabezal.id_cabezal'
      )
      .leftJoinAndMapOne(
        'cabezal.numero_bidon',
        'numero_bidon',
        'numero_bidon',
        'numero_bidon.id_llenadora = cabezal.id_llenadora AND numero_bidon.id_cabezal_llenadora = cabezal.id_cabezal'
      )
      .leftJoinAndSelect('a.producto', 'producto')
      .leftJoinAndSelect('a.ean', 'ean')
      .leftJoinAndSelect('ean.presentacion', 'presentacion')
      .orderBy('a.id_llenadora', 'ASC')
      .addOrderBy('a.id_cabezal_llenadora', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();

    return this.getAsociacionesByRole(asociaciones, userRole);
  }

  async findOne(
    term: string,
    plain: boolean = false,
    queryRunner?: QueryRunner
  ): Promise<AsociacionProduccion> {
    const manager = queryRunner?.manager ?? this.asociacionRepo.manager;

    let asociacion: AsociacionProduccion | null = null;

    if (isUUID(term)) {
      asociacion = await manager.findOne(AsociacionProduccion, {
        where: { id: term },
        relations: {
          llenadora: true,
          cabezal: true,
          producto: true,
          ean: {
            presentacion: true,
          },
        },
      });
    } else {
      const id_llenadora = term.substring(0, 2).toUpperCase();
      const id_cabezal_llenadora = term.substring(2).toUpperCase();

      asociacion = await manager
        .createQueryBuilder(AsociacionProduccion, 'a')
        .leftJoinAndSelect('a.llenadora', 'llenadora')
        .leftJoinAndSelect('a.cabezal', 'cabezal')
        .leftJoinAndSelect('a.producto', 'producto')
        .leftJoinAndSelect('a.ean', 'ean')
        .leftJoinAndSelect('ean.presentacion', 'presentacion')
        .where(
          'a.id_llenadora = :id_llenadora AND a.id_cabezal_llenadora = :id_cabezal_llenadora',
          {
            id_llenadora,
            id_cabezal_llenadora,
          }
        )
        .getOne();
    }

    if (!asociacion) {
      throw new NotFoundException(i18n.errors.asociacionNoEncontrada(term));
    }

    if (plain) {
      const { producto, ean, llenadora, cabezal, ...rest } = asociacion;
      return rest as AsociacionProduccion;
    }

    return asociacion;
  }

  async findAllRutasEtiquetas(
    paginationDto: PaginationDto
  ): Promise<string[] | PaginationResponse<string>> {
    const qb = this.asociacionRepo
      .createQueryBuilder('asociacion')
      .select('DISTINCT asociacion.ruta_etiqueta', 'ruta_etiqueta')
      .orderBy('asociacion.ruta_etiqueta', 'ASC');

    const paginator = new Paginator(this.asociacionRepo);
    return paginator.paginateRawQueryBuilder(
      qb,
      paginationDto,
      (row) => row.ruta_etiqueta
    );
  }

  async queryAsociacionesV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<AsociacionProduccion>(
      this.asociacionRepo
    );
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  async updateWithTransaction(id: string, dto: UpdateAsociacionProduccionDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(AsociacionProduccion);

      let asociacion = await this.findOne(id, true, queryRunner);

      if (dto.codigo_ean && !dto.id_producto) {
        const ean = await this.eanService.findOne(dto.codigo_ean, queryRunner);
        const producto = await this.productosService.findOne(
          ean.id_producto,
          queryRunner
        );

        asociacion.codigo_ean = ean.codigo_ean;
        asociacion.id_producto = producto.id_producto;
        asociacion.familia_producto = producto.familia_producto;
      }

      if (dto.id_producto && !dto.codigo_ean) {
        throw new ForbiddenException(
          i18n.errors.actualizarSoloIdProducto()
        );
      }

      if (dto.codigo_ean && dto.id_producto) {
        const ean = await this.eanService.findOne(dto.codigo_ean, queryRunner);

        if (ean.id_producto !== dto.id_producto) {
          throw new ConflictException(
            i18n.errors.eanNoPerteneceProducto(dto.codigo_ean, dto.id_producto)
          );
        }

        const producto = await this.productosService.findOne(
          dto.id_producto,
          queryRunner
        );

        asociacion.codigo_ean = dto.codigo_ean;
        asociacion.id_producto = dto.id_producto;
        asociacion.familia_producto = producto.familia_producto;
      }

      if (dto.limite_llenado !== undefined) {
        asociacion.limite_llenado = dto.limite_llenado;
      }

      if (dto.ruta_etiqueta) {
        if (!this.bartenderService.rutaEtiquetaIsOk(dto.ruta_etiqueta)) {
          throw new NotFoundException(
            i18n.errors.rutaEtiquetaNoOk(dto.ruta_etiqueta)
          );
        }
        asociacion.ruta_etiqueta = dto.ruta_etiqueta;
      }

      const asociacionDB = await repo.save(asociacion);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.ASOCIACION_PRODUCCION,
        SyncOperacion.UPDATE,
        asociacionDB,
        this.asociacionRepo.target
      );

      this.websocketsService.emitWsEvent({
        type: ServiceType.HOME,
        payload: { method: HomeServiceMethod.GET_ASOCIACIONES },
      });

      return asociacionDB;
    });
  }

  async getAsociacionesByRole(
    asociaciones: AsociacionProduccion[],
    userRole: UserRole
  ): Promise<AsociacionProduccion[]> {
    const userAllowedLlenadorasRule = (
      await this.rolesServide.findOne(userRole)
    ).llenadoras_permitidas;

    return this.filterAsociacionesByRule(
      asociaciones,
      userAllowedLlenadorasRule
    );
  }

  filterAsociacionesByRule(
    asociaciones: AsociacionProduccion[],
    rule: string
  ): AsociacionProduccion[] {
    if (rule === LlenadorasPermitidasCabecera.TODAS) return asociaciones;
    if (rule === LlenadorasPermitidasCabecera.NINGUNA) return [];

    if (rule.startsWith(LlenadorasPermitidasCabecera.TODAS_MENOS)) {
      const idsExcluded = rule
        .replace(LlenadorasPermitidasCabecera.TODAS_MENOS, '')
        .split(',');
      return asociaciones.filter((a) => !idsExcluded.includes(a.id_llenadora));
    }

    if (rule.startsWith(LlenadorasPermitidasCabecera.NINGUNA_MENOS)) {
      const idsAllowed = rule
        .replace(LlenadorasPermitidasCabecera.NINGUNA_MENOS, '')
        .split(',');
      return asociaciones.filter((a) => idsAllowed.includes(a.id_llenadora));
    }

    return [];
  }

  getRepository(): Repository<AsociacionProduccion> {
    return this.asociacionRepo;
  }
}
