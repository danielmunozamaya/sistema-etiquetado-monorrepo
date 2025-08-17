import {
  Controller,
  Post,
  Body,
  // Get,
  // Param,
  // Patch,
  // Delete,
  // Query,
  UseGuards,
} from '@nestjs/common';

import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
// import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
// import { PaginationDto } from 'src/common/dto/pagination.dto';
// import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/types/common.types';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.createWithTransaction(dto);
  }

  // @UseGuards(JwtAuthGuard, UserExistsGuard)
  // @Get()
  // findAll(@Query() paginationDto: PaginationDto) {
  //   return this.usuariosService.findAll(paginationDto);
  // }

  // @UseGuards(JwtAuthGuard, UserExistsGuard)
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usuariosService.findOne(id);
  // }

  // @UseGuards(JwtAuthGuard, UserExistsGuard)
  // @Post('v2/query')
  // queryUsuariosV2(
  //   @Body() complexQueryDto: ComplexQueryDto,
  //   @Query() paginationDto: PaginationDto
  // ) {
  //   return this.usuariosService.queryUsuariosV2(complexQueryDto, paginationDto);
  // }

  // @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
  //   return this.usuariosService.updateWithTransaction(id, dto);
  // }

  // @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usuariosService.removeWithTransaction(id);
  // }

  @Post('/login')
  login(@Body() dto: LoginUsuarioDto) {
    return this.usuariosService.login(dto);
  }
}
