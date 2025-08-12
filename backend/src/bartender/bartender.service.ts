import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { i18n } from 'src/main';
import axios from 'axios';
import { CreateBartenderConfigDto } from './dto/create-bartender-config.dto';
import { UpdateBartenderConfigDto } from './dto/update-bartender-config.dto';
import { Produccion } from 'src/produccion/entities/produccion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BartenderConfig } from './entities/bartender-config.entity';
import { Repository } from 'typeorm';
import { AsociacionProduccionService } from 'src/asociacion-produccion/asociacion-produccion.service';
import { TipoEtiqueta } from './types/tipo_etiqueta.type';
import { BartenderBody } from './types/bartender-body.type';
import { ProductosService } from 'src/productos/productos.service';
import { AsociacionProduccion } from 'src/asociacion-produccion/entities/asociacion-produccion.entity';
import { Usuarios } from 'src/usuarios/entities/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class BartenderService {
  private readonly logger = new Logger(BartenderService.name);

  constructor(
    @InjectRepository(BartenderConfig)
    private readonly configRepo: Repository<BartenderConfig>,
    @Inject(forwardRef(() => AsociacionProduccionService))
    private readonly asociacionService: AsociacionProduccionService,
    @Inject(forwardRef(() => ProductosService))
    private readonly productosService: ProductosService,
    @Inject(forwardRef(() => UsuariosService))
    private readonly usuariosService: UsuariosService
  ) {}

  async create(createBartenderConfigDto: CreateBartenderConfigDto) {
    const count = await this.configRepo.count();
    if (count > 0) {
      throw new BadRequestException(i18n.errors.bartenderConfigYaExiste());
    }

    const config = this.configRepo.create({
      ...createBartenderConfigDto,
      puerto: createBartenderConfigDto.puerto.toString(),
    });

    return this.configRepo.save(config);
  }

  async findOne() {
    const config_array = await this.configRepo.find();

    if (!config_array.length) {
      throw new NotFoundException(i18n.errors.bartenderConfigNoExiste());
    }

    return config_array[0];
  }

  async update(updateBartenderConfigDto: UpdateBartenderConfigDto) {
    const config = await this.findOne();

    if (!config) {
      throw new NotFoundException(i18n.errors.bartenderConfigNoExisteParaActualizar());
    }

    console.log(updateBartenderConfigDto);

    const updated = this.configRepo.merge(config, {
      ...updateBartenderConfigDto,
      puerto:
        updateBartenderConfigDto.puerto !== undefined
          ? updateBartenderConfigDto.puerto.toString()
          : config.puerto,
    });

    return this.configRepo.save(updated);
  }

  async remove() {
    await this.configRepo.clear();
  }

  formatPeso(peso: number | string | null | undefined): string {
    if (peso === null || peso === undefined || peso === '') return '';
    const num = Number(peso);
    if (isNaN(num)) return '';
    return num.toFixed(2);
  }

  async doPrint(
    registros: Produccion[],
    tipoEtiqueta: TipoEtiqueta,
    userUuid?: string
  ): Promise<void> {
    try {
      // this.logger.log(`Enviando ${registros.length} registros a impresión...`);

      for (const registro of registros) {
        const id_llenadora = registro.id_llenadora;
        const id_cabezal = registro.id_cabezal_llenadora;
        let asociacion_produccion: AsociacionProduccion;
        let nombre_producto: string = '';
        let familia_producto: string = '';
        let ruta_impresion: string = '';
        let ruta_etiqueta: string = '';

        if (!id_llenadora || !id_cabezal) {
          this.logger.error(
            `No se puede imprimir el registro de producción ${registro.id} porque no cuenta con id_llenadora o id_cabezal`
          );
          continue;
        }

        asociacion_produccion = await this.asociacionService.findOne(
          `${id_llenadora}${id_cabezal}`
        );

        if (!asociacion_produccion) {
          this.logger.error(
            `No se pudo encontrar el registro de Asociación de la Producción del cabezal del registro ${registro.id}`
          );
          continue;
        }

        if (tipoEtiqueta === TipoEtiqueta.AUTOMATICA) {
          nombre_producto =
            asociacion_produccion.producto?.nombre_producto ?? '';
          familia_producto =
            asociacion_produccion.producto?.familia_producto ?? '';
          ruta_etiqueta = asociacion_produccion.ruta_etiqueta ?? '';
          ruta_impresion = asociacion_produccion.cabezal?.ruta_impresion ?? '';
        }

        if (
          tipoEtiqueta === TipoEtiqueta.SEMIAUTOMATICA ||
          tipoEtiqueta === TipoEtiqueta.MANUAL
        ) {
          let usuario: Usuarios | undefined = undefined;
          if (userUuid) usuario = await this.usuariosService.findOne(userUuid);
          ruta_impresion = usuario ? usuario.ruta_impresion_manual : '';
          ruta_etiqueta = asociacion_produccion.ruta_etiqueta ?? '';
        }

        if (tipoEtiqueta === TipoEtiqueta.SEMIAUTOMATICA) {
          nombre_producto =
            asociacion_produccion.producto?.nombre_producto ?? '';
          familia_producto =
            asociacion_produccion.producto?.familia_producto ?? '';
        }

        if (tipoEtiqueta === TipoEtiqueta.MANUAL) {
          const producto = await this.productosService.findOne(
            registro.id_producto
          );
          nombre_producto = producto.nombre_producto;
          familia_producto = producto.familia_producto;
        }

        let bartender_body = {} as BartenderBody;

        try {
          bartender_body = {
            TIPO_ETIQUETA: TipoEtiqueta[registro.tipo_etiqueta]
              ? TipoEtiqueta[registro.tipo_etiqueta]
              : '',
            ID_LLENADORA: registro.id_llenadora ? registro.id_llenadora : '',
            ID_CABEZAL: registro.id_cabezal_llenadora
              ? registro.id_cabezal_llenadora
              : '',
            NO_BIDON: registro.no_bidon ? String(registro.no_bidon) : '',
            NO_MATRICULA: registro.no_matricula ? registro.no_matricula : '',
            NO_LOTE: registro.no_lote ? registro.no_lote : '',
            SSCC: registro.sscc ? registro.sscc : '',
            PRODUCTO: nombre_producto ? nombre_producto : '',
            FAMILIA_PRODUCTO: familia_producto ? familia_producto : '',
            CODIGO_EAN: registro.codigo_ean ? registro.codigo_ean : '',
            FECHA_PRODUCCION: registro.fecha_produccion
              ? registro.fecha_produccion
              : '',
            HORA_PRODUCCIION: registro.hora_produccion
              ? registro.hora_produccion
              : '',
            FECHA_CADUCIDAD: registro.fecha_caducidad
              ? registro.fecha_caducidad
              : '',
            FECHA_CADUCIDAD_NO_BARS: registro.fecha_caducidad
              ? (registro.fecha_caducidad.split('-').join('') ?? '')
              : '',
            CODE: registro.code ? String(registro.code) : '',
            PESO_NETO_REAL: this.formatPeso(registro.peso_neto_real),
            PESO_NETO_ETIQUETA: this.formatPeso(registro.peso_neto_etiqueta),
            PESO_BRUTO_ETIQUETA: this.formatPeso(registro.peso_bruto_etiqueta),
            TITULO_1: registro.titulo_1 ? registro.titulo_1 : '',
            VALOR_1: registro.valor_1 ? registro.valor_1 : '',
            TITULO_2: registro.titulo_2 ? registro.titulo_2 : '',
            VALOR_2: registro.valor_2 ? registro.valor_2 : '',
            RUTA_IMPRESION: ruta_impresion ? ruta_impresion : '',
            RUTA_ETIQUETA: ruta_etiqueta ? ruta_etiqueta : '',
          };

          // this.logger.debug(bartender_body);
        } catch (error) {
          this.logger.error(
            `Error al construir el body de la impresión para el registro ${registro.id}`
          );
          continue;
        }

        let bartender_config = {} as BartenderConfig;

        try {
          bartender_config = await this.findOne();
        } catch (error) {
          this.logger.error(
            `Configuración de Bartender no encontrada en base de datos. No se pudo imprimir el registro ${registro.id}`
          );
          continue;
        }

        if (!this.rutaEtiquetaIsOk(bartender_body.RUTA_ETIQUETA)) {
          this.logger.error(
            `No se encontró ninguna etiqueta en la ruta especificada para el registro ${registro.id}`
          );
          continue;
        }

        try {
          const protocol = bartender_config.protocolo_api;
          const host = bartender_config.host;
          const port = bartender_config.puerto;
          const route = bartender_config.ruta_api;
          const name = bartender_config.nombre_integracion;
          const command = bartender_config.comando;
          const response = await axios.post(
            `${protocol}://${host}:${port}/${route}/${name}/${command}`,
            bartender_body,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          // console.log(response);
          if (response && response.statusText && response.statusText === 'OK') {
            this.logger.debug(
              `Impresión del registro ${registro.id} enviada con éxito`
            );
          }
        } catch (error) {
          if (error.response && error.response.data) {
            this.logger.error(
              `Error enviando impresión a Bartender para el registro ${registro.id}: ${error.response.data}`
            );
          } else {
            this.logger.error(
              `[ERROR INESPERADO] Error enviando impresión a Bartender para el registro ${registro.id}: ${error.message}`
            );
          }
        }
      }
    } catch (error) {
      const error_message = JSON.stringify(error);
      this.logger.error(
        `Error durante la impresión con Bartender: ${error_message}`
      );
    }
  }

  rutaEtiquetaIsOk(ruta: string) {
    const ruta_normalizada = ruta.replace(/"/g, '');
    return existsSync(ruta_normalizada);
  }
}
