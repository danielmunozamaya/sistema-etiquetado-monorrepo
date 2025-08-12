import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { i18nFactory } from './i18n';
import { Dictionary } from 'src/common/types/i18n.types';

import { AppModule } from './app.module';
import { MySocketIoAdapter } from './websockets/websockets.adapter';
import { SyncGuard } from './common/guards/sync.guard';

const lang = (process.env.APP_LANGUAGE as 'es' | 'pt') || 'es';
export const i18n = i18nFactory<Dictionary>(lang);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.useWebSocketAdapter(new MySocketIoAdapter(app));

  const syncGuard = app.get(SyncGuard);
  app.useGlobalGuards(syncGuard);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
