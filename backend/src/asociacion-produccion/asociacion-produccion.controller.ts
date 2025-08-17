import {
  Controller,
  Get,
  // Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AsociacionProduccionService } from './asociacion-produccion.service';
// import { CreateAsociacionProduccionDto } from './dto/create-asociacion-produccion.dto';
import { UpdateAsociacionProduccionDto } from './dto/update-asociacion-produccion.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
// import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { UserJWT } from 'src/common/types/auth.types';

@Controller('asociacion-produccion')
export class AsociacionProduccionController {
  constructor(private readonly service: AsociacionProduccionService) {}

  // @UseGuards(JwtAuthGuard, UserExistsGuard)
  // @Post()
  // create(@Body() dto: CreateAsociacionProduccionDto) {
  //   return this.service.createWithTransaction(dto);
  // }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() req: Request) {
    const userToken = req['user'] as UserJWT;
    return this.service.findAll(paginationDto, userToken.rol);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get('rutas-etiquetas')
  findAllRutasEtiquetas(@Query() paginationDto: PaginationDto) {
    return this.service.findAllRutasEtiquetas(paginationDto);
  }

  // @UseGuards(JwtAuthGuard, UserExistsGuard)
  // @Get(':term')
  // findOne(@Param('term') term: string) {
  //   return this.service.findOne(term);
  // }

  // @UseGuards(JwtAuthGuard, UserExistsGuard)
  // @Post('v2/query')
  // queryAsociacionesV2(
  //   @Body() complexQueryDto: ComplexQueryDto,
  //   @Query() paginationDto: PaginationDto
  // ) {
  //   return this.service.queryAsociacionesV2(complexQueryDto, paginationDto);
  // }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAsociacionProduccionDto
  ) {
    return this.service.updateWithTransaction(id, dto);
  }
}
