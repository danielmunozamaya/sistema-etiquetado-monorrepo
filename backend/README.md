<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Versiones

- NodeJS: v22.14.0
- NestJS: 11.0.7

## Para levantar la base de datos de desarrollo

`yarn run start:database`

## Para levantar el network (primary server y remote server) en desarrollo

`yarn run start:network`

## Para hacer un despliegue de la aplicación

### Antes de empezar, hay que tener tanto el servidor principal como el remoto (redundante) arrancados y con las bases de datos activas y sus respectivos usuarios creados. Antes de arrancar la aplicación web, las bases de datos deberán partir del mismo estado. Para ello, ambas deben empezar vacías. Las distintas tablas y los datos mínimos de provisionamiento se proporcionan desde el backend en el paso 11. Hay que tener precaución, pues este paso sólo debe hacerse en el despliegue para ambos servidores. De lo contrario, podrían perderse datos de producción.

- 0.- AVISO: Las siguientes órdenes deberán ejecutarse en ambos servidores simultáneamente. De lo contrario, no podrá establecerse redundancia entre ellos.
- 0.a.- PREVIO: Comprobar que existe conexión (ping) entre ambos servidores, así como entre servidores y bases de datos (conexión server_local -- db_local, server_local -- db_remota, server_remoto -- db_local, server_remoto -- db_remota)
- 1.- Obtener el código fuente (clonar repositorios si procede)
- 2.- Eliminar carpeta /.git (no obligatorio)
- 3.- Entrar en la carpeta del backend y hacer `yarn install`
- 4.- Entrar en la carpeta del frontend y hacer `npm i`
- 5.- En la carpeta de frontend, hacer `npm run build`
- 6.- Copiar todos los ficheros dentro de frontend/dist/ dentro de backend/public/
- 7.- En la carpeta de backend, crear ficheros .env, .env.dev y .env.prod
- 8.- Rellenar ficheros .evn, .env.dev y .env.prod con los datos mostrados en .env.template
- 9.- DESARROLLO: Si se quiere hacer un despliegue en desarrollo, ejecutar desde backend `yarn run start:dev`
- 10.- PRODUCCIÓN: Si se quiere hacer un despliegue en producción, ejecutar desde backend `pm2 start ecosystem.config.js` + `pm2 save` + `pm2-startup install`
- 11.- PRECAUCIÓN, ESTO BORRARÁ LOS DATOS DE LA BASE DE DATOS E INCLUIRÁ DATOS NUEVOS DESDE 0. ES NECESARIA ESTA ACCIÓN EN EL PRIMER DESPLIEGUE DE LA APLICACIÓN, YA QUE AMBAS BASES DE DATOS DEBEN ESTAR CORRECTAMENTE PROVISIONADAS, ADEMÁS DE PARTIR DEL MISMO ESTADO PARA PODER SINCRONIZARSE ENTRE ELLAS: Si se quiere provisionar la base de datos, ejecutar `curl http://localhost:3000/api/seed`
- 12.- Crear integración de Bartender (se hace en el propio Bartender Integration Service)
- 13.- Añadir registro de configuración de bartender en la tabla de bartender_config de base de datos. Modificar estos datos si los datos de configuración de la integración de Bartender cambia en algún momento. Ejemplo en formato JSON: `{"id": "6d5f433e-f36b-1410-8ce2-00af0c2de9b7","protocolo_api":"http","host": "localhost","puerto": "80","ruta_api": "Integration","nombre_integracion": "IntegraciónServicioweb","comando": "Execute"}`
- 14.- Lanzar integración de Bartender como servicio (se hace en el propio Bartender Integration Service)
- 15.- Arrancar aplicación ejecutando `http://localhost:3000` en el navegador web (se puede crear un acceso directo posteriormente, además de un nombre en el DNS local)
