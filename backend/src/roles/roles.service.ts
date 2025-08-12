import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, QueryRunner, Repository } from 'typeorm';
import { i18n } from 'src/main';
import { isUUID } from 'class-validator';

import { Roles } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { SyncTabla } from 'src/common/types/common.types';
import { SyncOperacion } from 'src/common/types/sync.types';
import { SincronismoService } from 'src/sincronismo/sincronismo.service';
import { SyncableService } from 'src/common/interfaces/syncable-service.interface';
import { TransactionalService } from 'src/common/services/transactional.service';

@Injectable()
export class RolesService
  extends TransactionalService
  implements SyncableService<Roles>
{
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepo: Repository<Roles>,
    dataSource: DataSource,
    @Inject(forwardRef(() => SincronismoService))
    private readonly sincronismoService: SincronismoService
  ) {
    super(dataSource);
  }

  async createWithTransaction(dto: CreateRolDto) {
    return this.executeTransaction(async (queryRunner) => {
      const repo = queryRunner.manager.getRepository(Roles);

      const exists = await repo.findOne({
        where: { rol: dto.rol.toUpperCase() },
      });

      if (exists) {
        throw new ConflictException(i18n.errors.rol_yaExiste(dto.rol));
      }

      const rol = repo.create({ rol: dto.rol.toUpperCase() });
      const rolDB = await repo.save(rol);

      await this.sincronismoService.localSyncTableAppendTransaction(
        queryRunner,
        SyncTabla.ROLES,
        SyncOperacion.CREATE,
        rolDB,
        this.rolesRepo.target
      );

      return rolDB;
    });
  }

  async findAll() {
    return this.rolesRepo.find();
  }

  async findOne(term: string, queryRunner?: QueryRunner) {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(Roles)
      : this.rolesRepo;

    let rol: Roles | null = null;

    if (isUUID(term)) rol = await repo.findOneBy({ id: term });

    if (!rol && !isUUID(term))
      rol = await repo.findOne({ where: { rol: term.toUpperCase() } });

    if (!rol) throw new NotFoundException(i18n.errors.rol_noEncontrado(term));

    return rol;
  }

  async removeAll() {
    await this.rolesRepo.deleteAll();
  }

  getRepository(): Repository<Roles> {
    return this.rolesRepo;
  }
}
