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

import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { QueryProductoDto } from './dto/query-producto.dto';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/types/common.types';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productosService.createWithTransaction(dto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productosService.findAll(paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get('familias')
  getFamilias(@Query() paginationDto: PaginationDto) {
    return this.productosService.findAllFamilias(paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get('familia/:familia')
  getByFamilia(@Param('familia') familia: string) {
    return this.productosService.findByFamilia(familia);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productosService.findOne(term);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('query')
  queryProductos(
    @Body() body: QueryProductoDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.productosService.queryProductos(body, paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('v2/query')
  queryProductosV2(
    @Body() complexQueryDto: ComplexQueryDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.productosService.queryProductosV2(
      complexQueryDto,
      paginationDto
    );
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductoDto
  ) {
    return this.productosService.updateWithTransaction(id, dto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productosService.removeWithTransaction(id);
  }
}
