import { parse } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

const ENV = process.env.ENVIRONMENT || 'dev';

const Config = {
  dev: {},
  prod: {},
};

['dev', 'prod'].forEach((mode) => {
  const file = resolve(process.cwd(), `.env.${mode}`);
  if (existsSync(file)) {
    const vars = parse(readFileSync(file));
    Config[mode] = vars;
  }
});

Config['dev']['DB_CONNECTION'] = TypeOrmModule.forRoot({
  type: 'mssql',
  host: Config[ENV].DB_HOST,
  port: +Config[ENV].DB_PORT,
  username: Config[ENV].DB_USERNAME,
  password: Config[ENV].DB_PASSWORD,
  database: Config[ENV].DB_NAME,
  synchronize: false,
  // dropSchema: true, // Sólo para la fase de diseño de Entidades y Relaciones entre ellas - cuidado porque borra la base de datos
  autoLoadEntities: true,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  extra: {
    enableArithAbort: true,
    connectTimeout: 15000,
    requestTimeout: 30000,
    keepAlive: true,
  },
});

Config['prod']['DB_CONNECTION'] = TypeOrmModule.forRoot({
  type: 'mssql',
  host: Config[ENV].DB_HOST,
  port: +Config[ENV].DB_PORT,
  username: Config[ENV].DB_USERNAME,
  password: Config[ENV].DB_PASSWORD,
  database: Config[ENV].DB_NAME,
  synchronize: false,
  autoLoadEntities: true,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  extra: {
    enableArithAbort: true,
    connectTimeout: 15000,
    requestTimeout: 30000,
    keepAlive: true,
  },
});

Config['dev']['REMOTE_DB_CONNECTION'] = {
  type: 'mssql',
  host: Config[ENV].REMOTE_DB_HOST,
  port: +Config[ENV].REMOTE_DB_PORT,
  username: Config[ENV].REMOTE_DB_USERNAME,
  password: Config[ENV].REMOTE_DB_PASSWORD,
  database: Config[ENV].REMOTE_DB_NAME,
  synchronize: false,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  extra: {
    enableArithAbort: true,
    connectTimeout: 15000,
    requestTimeout: 30000,
    keepAlive: true,
  },
};

Config['prod']['REMOTE_DB_CONNECTION'] = {
  type: 'mssql',
  host: Config[ENV].REMOTE_DB_HOST,
  port: +Config[ENV].REMOTE_DB_PORT,
  username: Config[ENV].REMOTE_DB_USERNAME,
  password: Config[ENV].REMOTE_DB_PASSWORD,
  database: Config[ENV].REMOTE_DB_NAME,
  synchronize: false,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  extra: {
    enableArithAbort: true,
    connectTimeout: 15000,
    requestTimeout: 30000,
    keepAlive: true,
  },
};

export { Config, ENV };
