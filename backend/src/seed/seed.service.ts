import { Injectable } from '@nestjs/common';

import { readFileSync } from 'fs';
import { join } from 'path';

import { DataSource } from 'typeorm';

import { ENV } from 'src/config/environment';

// import { LlenadorasService } from '../llenadoras/llenadoras.service';
// import { CabezalesService } from '../cabezales/cabezales.service';
// import { ProductosService } from '../productos/productos.service';
// import { PresentacionesService } from '../presentaciones/presentaciones.service';
// import { EanService } from '../ean/ean.service';
// import { MotivoBajasService } from '../motivo-bajas/motivo-bajas.service';
// import { RolesService } from '../roles/roles.service';
// import { AsociacionProduccionService } from '../asociacion-produccion/asociacion-produccion.service';
// import { UsuariosService } from '../usuarios/usuarios.service';
// import { PesosService } from '../pesos/pesos.service';
// import { ProduccionService } from 'src/produccion/produccion.service';

// import * as seedData from './data/data';

@Injectable()
export class SeedService {
  constructor(
    private readonly dataSource: DataSource
    // private readonly llenadorasService: LlenadorasService,
    // private readonly cabezalesService: CabezalesService,
    // private readonly productosService: ProductosService,
    // private readonly presentacionesService: PresentacionesService,
    // private readonly eansService: EanService,
    // private readonly motivoBajasService: MotivoBajasService,
    // private readonly rolesService: RolesService,
    // private readonly asociacionService: AsociacionProduccionService,
    // private readonly usuariosService: UsuariosService,
    // private readonly pesosService: PesosService
    // private readonly produccionService: ProduccionService,
  ) {}

  async executeSeed() {
    await this.cleanDatabase();
    await this.insertSeedData();
    return { message: 'Seed ejecutado con éxito usando servicios' };
  }

  private async cleanDatabase() {
    if (ENV !== 'dev') {
      throw new Error(
        'cleanDatabase() solo puede ejecutarse en entorno de desarrollo'
      );
    }
    await this.dataSource.synchronize(true);
  }

  private async insertSeedData() {
    // for (const llenadora of seedData.llenadoras) {
    //   await this.llenadorasService.create(llenadora);
    // }

    // for (const cabezal of seedData.cabezales) {
    //   await this.cabezalesService.create(cabezal);
    // }

    // for (const producto of seedData.productos) {
    //   await this.productosService.create(producto);
    // }

    // for (const presentacion of seedData.presentaciones) {
    //   await this.presentacionesService.create(presentacion);
    // }

    // for (const ean of seedData.eans) {
    //   await this.eansService.create(ean);
    // }

    // for (const motivo of seedData.motivoBajas) {
    //   await this.motivoBajasService.create(motivo);
    // }

    // for (const rol of seedData.roles) {
    //   await this.rolesService.create(rol);
    // }

    // // for (const asociacion of seedData.asociaciones) {
    // //   await this.asociacionService.create(asociacion);
    // // }

    // for (const usuario of seedData.usuarios) {
    //   await this.usuariosService.create(usuario);
    // }

    // for (const peso of seedData.pesos) {
    //   await this.pesosService.create(peso);
    // }

    const filePath = join(__dirname, 'scripts', 'PROD_SistemaEtiquetado_SOPRAGOL.sql');
    const sqlScript = readFileSync(filePath, 'utf8');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(sqlScript);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log('❌ Error al ejecutar seed SQL:', error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async eraseDatabase() {
    await this.cleanDatabase();
  }
}
