import {
  Controller,
  // Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { EanService } from './ean.service';
import { CreateEanDto } from './dto/create-ean.dto';
// import { UpdateEanDto } from './dto/update-ean.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { QueryEanDto } from './dto/query-ean.dto';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserRole } from 'src/common/types/common.types';

@Controller('ean')
export class EanController {
  constructor(private readonly eanService: EanService) {}

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateEanDto) {
    return this.eanService.createWithTransaction(dto);
  }

  // @UseGuards(JwtAuthGuard, UserExistsGuard)
  // @Get()
  // findAll(@Query() paginationDto: PaginationDto) {
  //   return this.eanService.findAll(paginationDto);
  // }

  // @UseGuards(JwtAuthGuard, UserExistsGuard)
  // @Get(':term')
  // findOne(@Param('term') term: string) {
  //   return this.eanService.findOne(term);
  // }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('query')
  queryEans(@Body() dto: QueryEanDto, @Query() paginationDto: PaginationDto) {
    return this.eanService.queryEans(dto, paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('v2/query')
  queryEansV2(
    @Body() complexQueryDto: ComplexQueryDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.eanService.queryEansV2(complexQueryDto, paginationDto);
  }

  // @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  // @Patch(':id')
  // update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEanDto) {
  //   return this.eanService.updateWithTransaction(id, dto);
  // }

  @UseGuards(JwtAuthGuard, UserExistsGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eanService.removeWithTransaction(id);
  }
}
