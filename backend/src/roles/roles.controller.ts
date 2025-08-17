import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
// import { CreateRolDto } from './dto/create-rol.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
// import { RoleGuard } from 'src/common/guards/role.guard';
// import { Roles } from 'src/common/decorators/roles.decorator';
// import { UserRole } from 'src/common/types/common.types';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  // @Post()
  // create(@Body() dto: CreateRolDto) {
  //   return this.rolesService.createWithTransaction(dto);
  // }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }
}
