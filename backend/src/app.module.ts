import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';

import { DataSource } from 'typeorm';

import { Config, ENV } from 'src/config/environment';
import { LlenadorasModule } from './llenadoras/llenadoras.module';
import { CabezalesModule } from './cabezales/cabezales.module';
import { ProductosModule } from './productos/productos.module';
import { PresentacionesModule } from './presentaciones/presentaciones.module';
import { EansModule } from './ean/ean.module';
import { MotivoBajasModule } from './motivo-bajas/motivo-bajas.module';
import { AsociacionProduccionsModule } from './asociacion-produccion/asociacion-produccion.module';
import { ProduccionsModule } from './produccion/produccion.module';
import { PesosModule } from './pesos/pesos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { SincronismoModule } from './sincronismo/sincronismo.module';
import { CommonModule } from './common/common.module';
import { NumeroBidonModule } from './numero_bidon/numero_bidon.module';
import { SeedModule } from './seed/seed.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { BartenderModule } from './bartender/bartender.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    Config[ENV].DB_CONNECTION,
    LlenadorasModule,
    CabezalesModule,
    ProductosModule,
    PresentacionesModule,
    EansModule,
    MotivoBajasModule,
    AsociacionProduccionsModule,
    ProduccionsModule,
    PesosModule,
    UsuariosModule,
    RolesModule,
    SincronismoModule,
    CommonModule,
    NumeroBidonModule,
    SeedModule,
    WebsocketsModule,
    BartenderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    // console.log(Config[ENV]);

    if (ENV === 'dev') {
      const masterDataSource = new DataSource({
        type: 'mssql',
        host: Config[ENV]['DB_HOST'],
        port: +Config[ENV]['DB_PORT'],
        username: Config[ENV]['DB_USERNAME'],
        password: Config[ENV]['DB_PASSWORD'],
        database: 'master',
        options: {
          encrypt: false,
        },
      });

      async function createDatabase() {
        const dbName = Config[ENV]['DB_NAME'];

        await masterDataSource.initialize();

        await masterDataSource.query(`
          IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${dbName}')
          BEGIN
            CREATE DATABASE [${dbName}]
          END
        `);

        await masterDataSource.destroy();
      }

      createDatabase()
        .then(() => {
          console.log(
            '✅ Base de datos SQL Server en desarrollo creada/verificada.'
          );
        })
        .catch((err) => {
          console.error(
            '❌ Error creando la base de datos SQL Server en desarrollo:',
            err
          );
        });
    }
  }
}
