import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PesosService } from './pesos.service';
import { QueryPesosDto } from './dto/query-pesos.dto';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';

@Controller('pesos')
export class PesosController {
  constructor(private readonly pesosService: PesosService) {}

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('query')
  queryPesos(@Body() dto: QueryPesosDto) {
    return this.pesosService.queryPesos(dto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('v2/query')
  queryPesosV2(
    @Body() complexQueryDto: ComplexQueryDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.pesosService.queryPesosV2(complexQueryDto, paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get('v3/query')
  queryPesosV3() {
    return this.pesosService.queryPesosV3();
  }
}
