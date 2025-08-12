import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { MotivoBajasService } from './motivo-bajas.service';
import { CreateMotivoBajaDto } from './dto/create-motivo-baja.dto';
import { UpdateMotivoBajaDto } from './dto/update-motivo-baja.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from 'src/common/types/common.types';

@Controller('motivo-bajas')
export class MotivoBajasController {
  constructor(private readonly motivoBajasService: MotivoBajasService) {}

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateMotivoBajaDto) {
    return this.motivoBajasService.createWithTransaction(dto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.motivoBajasService.findAll(paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.motivoBajasService.findOne(term);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMotivoBajaDto
  ) {
    return this.motivoBajasService.updateWithTransaction(id, dto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.motivoBajasService.removeWithTransaction(id);
  }
}
