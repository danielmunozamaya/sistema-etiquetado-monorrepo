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

import { CabezalesService } from './cabezales.service';
import { CreateCabezalDto } from 'src/cabezales/dto/create-cabezales.dto';
import { UpdateCabezalDto } from 'src/cabezales/dto/update-cabezales.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { QueryCabezalDto } from './dto/query-cabezal.dto';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from 'src/common/types/common.types';

@Controller('cabezales')
export class CabezalesController {
  constructor(private readonly cabezalesService: CabezalesService) {}

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateCabezalDto) {
    return this.cabezalesService.createWithTransaction(dto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cabezalesService.findAll(paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('query')
  queryCabezales(
    @Body() dto: QueryCabezalDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.cabezalesService.queryCabezales(dto, paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.cabezalesService.findOne(term);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('v2/query')
  queryCabezalesV2(
    @Body() complexQueryDto: ComplexQueryDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.cabezalesService.queryCabezalesV2(
      complexQueryDto,
      paginationDto
    );
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCabezalDto
  ) {
    return this.cabezalesService.updateWithTransaction(id, dto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.cabezalesService.removeWithTransaction(id);
  // }
}
