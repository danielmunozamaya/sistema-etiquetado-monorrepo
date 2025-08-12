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

import { LlenadorasService } from './llenadoras.service';
import { CreateLlenadoraDto } from './dto/create-llenadora.dto';
import { UpdateLlenadoraDto } from './dto/update-llenadora.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { CreateLlenadoraCabezalesAndAsociacionesDTO } from './dto/create-all.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from 'src/common/types/common.types';

@Controller('llenadoras')
export class LlenadorasController {
  constructor(private readonly llenadorasService: LlenadorasService) {}

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createLlenadoraDto: CreateLlenadoraDto) {
    return this.llenadorasService.createWithTransaction(createLlenadoraDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post('all')
  createAll(
    @Body()
    createLlenadoraCabezalesAndAsociacionesDTO: CreateLlenadoraCabezalesAndAsociacionesDTO
  ) {
    return this.llenadorasService.createAllWithTransaction(
      createLlenadoraCabezalesAndAsociacionesDTO
    );
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.llenadorasService.findAll(paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get('slim')
  findAllSlim(@Query() paginationDto: PaginationDto) {
    return this.llenadorasService.findAllSlim(paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.llenadorasService.findOne(term);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('v2/query')
  queryLlenadorasV2(
    @Body() complexQueryDto: ComplexQueryDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.llenadorasService.queryLlenadorasV2(
      complexQueryDto,
      paginationDto
    );
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLlenadoraDto: UpdateLlenadoraDto
  ) {
    return this.llenadorasService.updateWithTransaction(id, updateLlenadoraDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.llenadorasService.removeWithTransaction(id);
  }
}
