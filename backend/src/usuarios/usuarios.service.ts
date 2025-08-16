import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { i18n } from 'src/main';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { Usuarios } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RolesService } from 'src/roles/roles.service';
import { isUUID } from 'class-validator';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { ComplexQueryBuilder } from 'src/common/classes/complex-query-builder.class';
import { buildResponse } from 'src/common/helpers/build-response';
import { LlenadorasService } from 'src/llenadoras/llenadoras.service';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { TransactionalService } from 'src/common/services/transactional.service';
import { Config, ENV } from 'src/config/environment';
import { PaginationDefaultValues } from 'src/common/types/pagination.types';

@Injectable()
export class UsuariosService
  extends TransactionalService
  implements SyncableService<Usuarios>
{
  constructor(
    @InjectRepository(Usuarios)
    private readonly usuariosRepo: Repository<Usuarios>,
    dataSource: DataSource,

    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => LlenadorasService))
    private readonly llenadorasService: LlenadorasService,
    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService
  ) {
    super(dataSource);
  }

  async createWithTransaction(dto: CreateUsuarioDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Usuarios);

      const existing = await repo.findOneBy({ nombre: dto.nombre });
      if (existing) {
        throw new ConflictException(i18n.errors.usuario_yaExiste(dto.nombre));
      }

      const rolEntity = await this.rolesService.findOne(dto.rol, queryRunner);
      if (!rolEntity) {
        throw new NotFoundException(i18n.errors.usuario_rolNoExiste(dto.rol));
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);

      const usuario = repo.create({
        nombre: dto.nombre,
        password: passwordHash,
        uuid_rol: rolEntity.id,
        ruta_impresion_manual: dto.ruta_impresion_manual,
      });

      const usuarioDB = await repo.save(usuario);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.USUARIOS,
        SyncOperacion.CREATE,
        usuarioDB,
        this.usuariosRepo.target
      );

      return usuarioDB;
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = PaginationDefaultValues.LIMIT,
      offset = PaginationDefaultValues.OFFSET,
    } = paginationDto;
    return this.usuariosRepo.find({
      where: { visible: true },
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string, queryRunner?: QueryRunner) {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(Usuarios)
      : this.usuariosRepo;

    let usuario: Usuarios | null = null;

    usuario = await repo.findOne({ where: { id: term } });

    if (!usuario)
      usuario = await repo.findOne({ where: { nombre: term } });

    if (!usuario)
      throw new NotFoundException(i18n.errors.usuario_noEncontrado(term));

    return usuario;
  }

  async queryUsuariosV2(
    complexQueryDto: ComplexQueryDto,
    paginationDto: PaginationDto
  ) {
    const complexQueryBuilder = new ComplexQueryBuilder<Usuarios>(
      this.usuariosRepo
    );
    const { data, total } = await complexQueryBuilder.execute(complexQueryDto);

    return buildResponse(data, total, paginationDto);
  }

  async updateWithTransaction(id: string, dto: UpdateUsuarioDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Usuarios);

      const usuario = await this.findOne(id, queryRunner);

      if (dto.password) usuario.password = await bcrypt.hash(dto.password, 10);

      const usuarioDB = await repo.save(usuario);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.USUARIOS,
        SyncOperacion.UPDATE,
        usuarioDB,
        this.usuariosRepo.target
      );

      return usuarioDB;
    });
  }

  async removeWithTransaction(id: string) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Usuarios);

      const usuario = await this.findOne(id, queryRunner);

      usuario.visible = false;

      const usuarioDB = await repo.save(usuario);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.USUARIOS,
        SyncOperacion.UPDATE,
        usuarioDB,
        this.usuariosRepo.target
      );

      return usuarioDB;
    });
  }

  async userExistsWithTransaction(uuid: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await queryRunner.manager.findOne(Usuarios, {
        where: { id: uuid },
      });

      await queryRunner.commitTransaction();

      if (user && user.visible) return true;

      return false;
    } catch (error) {
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginUsuarioDto) {
    const llenadorasCount = await this.llenadorasService.count();
    if (!llenadorasCount) {
      throw new UnauthorizedException(i18n.errors.usuario_bdNoProvisionada());
    }

    const usuario = await this.usuariosRepo.findOne({
      where: { nombre: dto.nombre, visible: true },
      relations: { rol: true },
    });
    if (
      !usuario ||
      !(await bcrypt.compare(dto.password, usuario.password)) ||
      !usuario.visible
    ) {
      throw new UnauthorizedException(
        i18n.errors.usuario_credencialesIncorrectas()
      );
    }

    const payload = {
      uuid: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol.rol,
    };

    const token = await this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });

    return { token };
  }

  getRepository(): Repository<Usuarios> {
    return this.usuariosRepo;
  }
}
