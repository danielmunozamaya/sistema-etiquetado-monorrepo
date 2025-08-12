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

import { PresentacionesService } from './presentaciones.service';
import { CreatePresentacionDto } from './dto/create-presentacion.dto';
import { UpdatePresentacionDto } from './dto/update-presentacion.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { QueryPresentacionDto } from './dto/query-presentacion.dto';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/types/common.types';

@Controller('presentaciones')
export class PresentacionesController {
  constructor(private readonly presentacionesService: PresentacionesService) {}

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreatePresentacionDto) {
    return this.presentacionesService.createWithTransaction(dto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.presentacionesService.findAll(paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.presentacionesService.findOne(term);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('query')
  queryPresentaciones(
    @Body() dto: QueryPresentacionDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.presentacionesService.queryPresentaciones(dto, paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('v2/query')
  queryPresentacionesV2(
    @Body() complexQueryDto: ComplexQueryDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.presentacionesService.queryPresentacionesV2(
      complexQueryDto,
      paginationDto
    );
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePresentacionDto
  ) {
    return this.presentacionesService.updateWithTransaction(id, dto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentacionesService.removeWithTransaction(id);
  }
}
