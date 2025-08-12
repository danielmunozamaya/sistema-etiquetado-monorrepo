import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  ObjectLiteral,
  QueryRunner,
  EntityTarget,
} from 'typeorm';
import { Sincronismo } from './entities/sincronismo.entity';
import { Config, ENV } from 'src/config/environment';
import { AsociacionProduccionService } from 'src/asociacion-produccion/asociacion-produccion.service';
import { CabezalesService } from 'src/cabezales/cabezales.service';
import { EanService } from 'src/ean/ean.service';
import { LlenadorasService } from 'src/llenadoras/llenadoras.service';
import { MotivoBajasService } from 'src/motivo-bajas/motivo-bajas.service';
import { NumeroBidonService } from 'src/numero_bidon/numero_bidon.service';
import { PresentacionesService } from 'src/presentaciones/presentaciones.service';
import { ProduccionService } from 'src/produccion/produccion.service';
import { ProductosService } from 'src/productos/productos.service';
import { RolesService } from 'src/roles/roles.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { SyncTabla } from 'src/common/types/common.types';
import { MAX_SYNC_RETRIES, SyncOperacion } from 'src/common/types/sync.types';
import { instanceToPlain } from 'class-transformer';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { hasId } from 'src/common/helpers/has-id.helper';
import { SyncState } from 'src/common/enums/sync.enums';
import { Productos } from 'src/productos/entities/producto.entity';
import { Llenadoras } from 'src/llenadoras/entities/llenadora.entity';
import { Cabezales } from 'src/cabezales/entities/cabezal.entity';
import { Ean } from 'src/ean/entities/ean.entity';
import { Presentaciones } from 'src/presentaciones/entities/presentacion.entity';
import { Roles } from 'src/roles/entities/rol.entity';
import { Usuarios } from 'src/usuarios/entities/usuario.entity';
import { MotivoBajas } from 'src/motivo-bajas/entities/motivo-baja.entity';
import { NumeroBidon } from 'src/numero_bidon/entities/numero_bidon.entity';
import { Produccion } from 'src/produccion/entities/produccion.entity';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { PesosService } from 'src/pesos/pesos.service';
import { Pesos } from 'src/pesos/entities/peso.entity';

@Injectable()
export class SincronismoService implements OnModuleInit {
  private remoteDataSource: DataSource;
  private remoteRepo: Repository<Sincronismo>;
  private readonly logger = new Logger(SincronismoService.name);
  private wasConnected = false;
  private isSyncRunning = false;
  private isCleanupRunning = false;
  private backendSynchronizing = false;

  constructor(
    @InjectRepository(Sincronismo)
    private readonly sincronismoRepo: Repository<Sincronismo>,

    @Inject(forwardRef(() => AsociacionProduccionService))
    private readonly asociacionProduccionService: AsociacionProduccionService,
    @Inject(forwardRef(() => CabezalesService))
    private readonly cabezalesService: CabezalesService,
    @Inject(forwardRef(() => EanService))
    private readonly eansService: EanService,
    @Inject(forwardRef(() => LlenadorasService))
    private readonly llenadorasService: LlenadorasService,
    @Inject(forwardRef(() => MotivoBajasService))
    private readonly motivoBajasService: MotivoBajasService,
    @Inject(forwardRef(() => NumeroBidonService))
    private readonly numeroBidonService: NumeroBidonService,
    @Inject(forwardRef(() => PresentacionesService))
    private readonly presentacionesService: PresentacionesService,
    @Inject(forwardRef(() => ProduccionService))
    private readonly produccionsService: ProduccionService,
    @Inject(forwardRef(() => ProductosService))
    private readonly productosService: ProductosService,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => UsuariosService))
    private readonly usuariosService: UsuariosService,
    @Inject(forwardRef(() => PesosService))
    private readonly pesosService: PesosService
  ) {}

  async onModuleInit() {
    if ((global as any).__syncInitialized) return;
    (global as any).__syncInitialized = true;

    this.safeRemoteSync();
    setInterval(() => this.safeRemoteSync(), 10000);
    setInterval(() => this.safeSyncedEdgeErrors(), 60000);

    this.logger.log('🔗 Sincronismo programado cada 10s');
  }

  async connectToRemoteDatabase() {
    try {
      this.remoteDataSource = new DataSource(Config[ENV].REMOTE_DB_CONNECTION);
      await this.remoteDataSource.initialize();

      if (!this.remoteDataSource?.isInitialized) {
        this.logger.warn(
          '[SYNC] RemoteDataSource no se inicializó correctamente'
        );
        this.wasConnected = false;
        return;
      }

      this.remoteRepo = this.remoteDataSource.getRepository(Sincronismo);
      if (!this.wasConnected) {
        this.logger.log('✅ Conexión a la base de datos remota establecida');
        this.wasConnected = true;
      }
    } catch (error) {
      this.logger.warn(
        `[SYNC] Error al conectar a la base remota: ${error.message ?? JSON.stringify(error)}`
      );
      this.wasConnected = false;
    }
  }

  private async safeRemoteSync() {
    if (this.isSyncRunning) return;
    this.isSyncRunning = true;
    try {
      await this.handleRemoteSync();
    } finally {
      this.isSyncRunning = false;
    }
  }

  private async safeSyncedEdgeErrors() {
    if (this.isCleanupRunning) return;
    this.isCleanupRunning = true;
    try {
      await this.handleSyncedEdgeErrors();
    } finally {
      this.isCleanupRunning = false;
    }
  }

  async handleSyncedEdgeErrors() {
    try {
      if (!this.wasConnected) await this.connectToRemoteDatabase();
      if (!this.wasConnected || !this.remoteDataSource || !this.remoteRepo)
        return;

      const registros = await this.remoteRepo.find({
        where: { estado: SyncState.SYNCED },
      });

      for (const registro of registros) {
        const { id } = registro;

        try {
          await this.remoteRepo.delete(id);
          this.logger.debug(
            `[SYNC] Eliminando registro de sincronismo ya marcado como SYNCED: ${JSON.stringify(registro)}`
          );
        } catch (error) {}
      }
    } catch (error) {}
  }

  async handleRemoteSync() {
    try {
      if (!this.wasConnected) await this.connectToRemoteDatabase();
      if (!this.wasConnected || !this.remoteDataSource || !this.remoteRepo)
        return;

      const registros = await this.remoteRepo.find({
        where: { estado: SyncState.PENDING },
        order: { fecha: 'ASC' },
      });

      for (const registro of registros) {
        const { id, tabla, operacion, registro: registroJson } = registro;

        try {
          this.backendSynchronizing = true;
          const success = await this.dispatchSync(
            tabla,
            operacion,
            registroJson
          );

          if (success) {
            registro.estado = SyncState.SYNCED;
          } else {
            registro.intentos < 5 ? (registro.intentos += 1) : null;
          }

          await this.remoteRepo.save(registro);
          // console.log(registro);

          if (
            registro.estado === SyncState.SYNCED ||
            registro.intentos >= MAX_SYNC_RETRIES
          ) {
            if (registro.intentos >= MAX_SYNC_RETRIES)
              this.logger.debug(
                `[SYNC] Eliminando registro de sincronismo debido a que superó el límite de intentos: ${JSON.stringify(registro)}`
              );
            await this.remoteRepo.delete(id);
          }
        } catch (error) {
          const mensaje =
            error instanceof Error ? error.message : JSON.stringify(error);
          this.logger.error(
            `❌ Error al sincronizar registro con ID ${id} en tabla ${tabla}: ${mensaje}`
          );

          registro.intentos < 5 ? (registro.intentos += 1) : null;
          await this.remoteRepo.save(registro);
        }
      }
    } catch (error) {
      if (this.wasConnected) {
        this.logger.warn('⚠️ Se ha perdido la conexión con la BD remota');
        this.wasConnected = false;
      } else {
        this.logger.debug('❌ Sin conexión remota. Reintentando en 5s...');
      }
      this.backendSynchronizing = false;
    }
    this.backendSynchronizing = false;
  }

  private async dispatchSync(
    tabla: SyncTabla,
    operacion: SyncOperacion,
    data: string | ObjectLiteral
  ): Promise<boolean> {
    const map: Partial<Record<SyncTabla, SyncableService<ObjectLiteral>>> = {
      [SyncTabla.PRODUCTOS]: this.productosService,
      [SyncTabla.LLENADORAS]: this.llenadorasService,
      [SyncTabla.CABEZALES]: this.cabezalesService,
      [SyncTabla.EAN]: this.eansService,
      [SyncTabla.PRESENTACIONES]: this.presentacionesService,
      [SyncTabla.ROLES]: this.rolesService,
      [SyncTabla.USUARIOS]: this.usuariosService,
      [SyncTabla.MOTIVO_BAJAS]: this.motivoBajasService,
      [SyncTabla.NUMERO_BIDON]: this.numeroBidonService,
      [SyncTabla.PRODUCCION]: this.produccionsService,
      [SyncTabla.ASOCIACION_PRODUCCION]: this.asociacionProduccionService,
      [SyncTabla.PESOS]: this.pesosService,
    };

    const service = map[tabla];
    if (!service) {
      this.logger.warn(
        `⚠️ Tabla desconocida, servicio no encontrado: ${tabla}`
      );
      return false;
    }

    const repo = service.getRepository();
    if (!repo) {
      this.logger.warn(
        `⚠️ Tabla desconocida, repositorio no encontrado: ${tabla}`
      );
      return false;
    }

    this.logger.log(
      `[SYNC]: tabla="${tabla}" | servicio=${service?.constructor?.name || 'undefined'} | operacion=${operacion} | data=${JSON.stringify(data)}`
    );

    try {
      await this.executeLocalSyncAction(data, repo, operacion);
      return true;
    } catch (error) {
      // this.logger.warn(
      //   `[dispatchSync] Error: ${error instanceof Error ? error.message : error}`
      // );
      return false;
    }
  }

  private async dispatchToRemoteSync(
    tabla: SyncTabla,
    operacion: SyncOperacion,
    data: string | ObjectLiteral
  ): Promise<boolean> {
    if (!this.remoteDataSource?.isInitialized) {
      this.logger.warn(`[SYNC REMOTA] DataSource remoto no inicializado`);
      return false;
    }

    const map: Partial<Record<SyncTabla, EntityTarget<ObjectLiteral>>> = {
      [SyncTabla.PRODUCTOS]: Productos,
      [SyncTabla.LLENADORAS]: Llenadoras,
      [SyncTabla.CABEZALES]: Cabezales,
      [SyncTabla.EAN]: Ean,
      [SyncTabla.PRESENTACIONES]: Presentaciones,
      [SyncTabla.ROLES]: Roles,
      [SyncTabla.USUARIOS]: Usuarios,
      [SyncTabla.MOTIVO_BAJAS]: MotivoBajas,
      [SyncTabla.NUMERO_BIDON]: NumeroBidon,
      [SyncTabla.PRODUCCION]: Produccion,
      [SyncTabla.ASOCIACION_PRODUCCION]: AsociacionProduccion,
      [SyncTabla.PESOS]: Pesos,
    };

    const entity = map[tabla];
    if (!entity) {
      this.logger.warn(`[SYNC REMOTA] Tabla no mapeada: ${tabla}`);
      return false;
    }

    const payload = typeof data === 'string' ? JSON.parse(data) : data;

    if (!hasId(payload)) {
      this.logger.warn(`[SYNC REMOTA] Payload sin ID en tabla ${tabla}`);
      return false;
    }

    const queryRunner = this.remoteDataSource.createQueryRunner();

    try {
      const repository = queryRunner.manager.getRepository(entity);
      await queryRunner.connect();

      switch (operacion) {
        case SyncOperacion.CREATE:
          await repository.save(payload);
          break;
        case SyncOperacion.UPDATE:
          await repository.save(payload);
          break;
        case SyncOperacion.DELETE:
          await repository.delete(payload.id);
          break;
        default:
          throw new Error('[SYNC REMOTA] Operación inválida');
      }

      return true;
    } catch (error) {
      this.logger.warn(
        `[SYNC REMOTA] Falló escritura directa en ${tabla}: ${error.message}`
      );
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async registerInLocalSyncTable(
    tabla: SyncTabla,
    operacion: SyncOperacion,
    registro: ObjectLiteral
  ): Promise<void> {
    try {
      const plain = instanceToPlain(registro);

      const nuevo = this.sincronismoRepo.create({
        operacion,
        tabla,
        registro: JSON.stringify(plain),
        fecha: new Date(),
      });

      await this.sincronismoRepo.save(nuevo);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `[SYNC] Error escribiendo en la tablad de sincronismo: ${tabla} | ${operacion} | ${mensaje}`
      );
    }
  }

  async remoteServerIsSyncing(queryRunner?: QueryRunner): Promise<boolean> {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(Sincronismo)
      : this.sincronismoRepo;

    return (await repo.count()) > 0;
  }

  async remoteConnectionAchieved() {
    await this.connectToRemoteDatabase();

    return !!(this.remoteDataSource?.isInitialized && this.wasConnected);
  }

  async localSyncTableAppendTransaction(
    queryRunner: QueryRunner,
    tabla: SyncTabla,
    operacion: SyncOperacion,
    registro: ObjectLiteral,
    entity: EntityTarget<ObjectLiteral>
  ): Promise<void> {
    try {
      const repo = queryRunner.manager.getRepository(Sincronismo);
      const metadata = queryRunner.manager.getRepository(entity).metadata;
      const registerColumns = metadata.columns.map((c) => c.propertyName);

      const plain = instanceToPlain(registro);
      const plainFiltered = Object.fromEntries(
        Object.entries(plain).filter(([key]) => registerColumns.includes(key))
      );

      const remoteServerIsSyncing =
        await this.remoteServerIsSyncing(queryRunner);

      if (!remoteServerIsSyncing) {
        const remoteConnectionAchieved = await this.remoteConnectionAchieved();

        if (remoteConnectionAchieved) {
          const success = await this.dispatchToRemoteSync(
            tabla,
            operacion,
            plainFiltered
          );

          if (success) return;
        }
      }

      const newSyncRegister = repo.create({
        operacion,
        tabla,
        registro: JSON.stringify(plain),
        fecha: new Date(),
      });

      await repo.save(newSyncRegister);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `[SYNC] Error sincronizando de forma directa y error escribiendo en la tablad de sincronismo: ${tabla} | ${operacion} | ${mensaje}`
      );
    }
  }

  async closeRemoteSyncConnection() {
    if (this.remoteDataSource?.isInitialized) {
      await this.remoteDataSource.destroy();
      this.wasConnected = false;
      this.logger.log('[🔌] Conexión remota cerrada');
    }
  }

  areThereDataToSynchronize(): boolean {
    return this.backendSynchronizing;
    // const tempDataSource = new DataSource({
    //   ...Config[ENV].REMOTE_DB_CONNECTION,
    //   name: 'temp-guard-connection', // opcional pero recomendable para debugging
    //   entities: [Sincronismo],
    // });

    // try {
    //   await tempDataSource.initialize();
    //   const repo = tempDataSource.getRepository(Sincronismo);

    //   const count = await repo.count();
    //   return count > 0;
    // } catch (error) {
    //   // const mensaje =
    //   //   error instanceof Error ? error.message : JSON.stringify(error);
    //   // this.logger.error(
    //   //   '❌ Error al contar registros remotos en SyncGuard:',
    //   //   mensaje
    //   // );
    //   return false;
    // } finally {
    //   if (tempDataSource.isInitialized) {
    //     await tempDataSource.destroy();
    //   }
    // }
  }

  async deleteRemoteSyncRegister(id: string): Promise<void> {
    if (!this.remoteRepo) {
      this.logger.warn(
        '⚠️ No se puede borrar: repositorio remoto no disponible'
      );
      return;
    }

    try {
      await this.remoteRepo.delete(id);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`❌ Error al borrar registro remoto ${id}:`, mensaje);
    }
  }

  async getRemoteSyncRegisters(): Promise<Sincronismo[]> {
    if (!this.remoteRepo) {
      this.logger.warn('⚠️ Repositorio remoto no disponible');
      return [];
    }

    try {
      return await this.remoteRepo.find({
        order: { fecha: 'ASC' },
      });
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error('❌ Error al obtener registros remotos:', mensaje);
      return [];
    }
  }

  async executeLocalSyncAction(
    dataJson: string | ObjectLiteral,
    repository: Repository<ObjectLiteral>,
    operation: SyncOperacion
  ): Promise<void> {
    try {
      const data =
        typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;

      if (!hasId(data)) {
        this.logger.warn(
          `[SYNC] No se puede procesar data sin 'id': ${JSON.stringify(data)}`
        );
        throw new Error('[executeLocalSyncAction] Sin id');
      }

      switch (operation) {
        case SyncOperacion.CREATE:
          await this.createLocalSyncRegister(data, repository);
          break;
        case SyncOperacion.UPDATE:
          await this.updateLocalSyncRegister(data, repository);
          break;
        case SyncOperacion.DELETE:
          await this.deleteLocalSyncRegister(data, repository);
          break;
        default:
          this.logger.warn(`⚠️ Operación desconocida: ${operation}`);
          throw new Error('[executeLocalSyncAction] Operación desconocida');
      }
    } catch (error) {
      throw new Error('[executeLocalSyncAction] Falló dispatch');
    }
  }

  async createLocalSyncRegister(
    data: ObjectLiteral,
    repository: Repository<ObjectLiteral>
  ): Promise<void> {
    try {
      const existe = await repository.findOneBy({ id: data.id });
      if (existe) {
        throw new Error(
          `Entrada no incluída debido a que ya existe: ${JSON.stringify(data)}`
        );
      }

      const nuevo = repository.create(data);
      await repository.save(nuevo);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `[SYNC] No se pudo crear la nueva entrada de sincronismo: ${mensaje}`
      );
      throw new Error('[createLocalSyncRegister] Error escribiendo en DB');
    }
  }

  async updateLocalSyncRegister(
    data: ObjectLiteral,
    repository: Repository<ObjectLiteral>
  ): Promise<void> {
    try {
      // CONVERTIMOS EL UPDATE EN UN UPSERT
      const existe = await repository.findOneBy({ id: data.id });
      if (!existe) {
        this.logger.warn(
          `Haciendo INSERT del registro debido a que no existía previamente: ${JSON.stringify(data)}`
        );
      }
      // const existe = await repository.findOneBy({ id: data.id });
      // if (!existe) {
      //   throw new Error(
      //     `Entrada no incluída debido a que no existía previamente: ${JSON.stringify(data)}`
      //   );
      // }

      await repository.save({ id: data.id, ...data });
      // await repository.save(data);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `[SYNC] No se pudo actualizar la nueva entrada de sincronismo: ${mensaje}`
      );
      throw new Error('[updateLocalSyncRegister] Error escribiendo en DB');
    }
  }

  async upsertLocalSyncRegister(
    data: ObjectLiteral,
    repository: Repository<ObjectLiteral>
  ): Promise<void> {
    try {
      const existe = await repository.findOneBy({ id: data.id });
      if (existe) {
        await repository.save({ id: data.id, ...data });
      } else {
        const nuevo = repository.create(data);
        await repository.save(nuevo);
      }
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `[SYNC] No se pudo hacer upsert de la nueva entrada de sincronismo: ${mensaje}`
      );
      throw new Error('[upsertLocalSyncRegister] Error escribiendo en DB');
    }
  }

  async deleteLocalSyncRegister(
    data: ObjectLiteral,
    repository: Repository<ObjectLiteral>
  ): Promise<void> {
    try {
      const existe = await repository.findOneBy({ id: data.id });
      if (!existe) {
        throw new Error(
          `Entrada no eliminada debido a que no existía previamente: ${JSON.stringify(data)}`
        );
      }

      await repository.delete({ id: data.id });
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `[SYNC] No se pudo eliminar la nueva entrada de sincronismo: ${mensaje}`
      );
      throw new Error('[deleteLocalSyncRegister] Error escribiendo en DB');
    }
  }
}
