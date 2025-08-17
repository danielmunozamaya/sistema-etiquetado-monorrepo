import { Controller, Post, Body, Query, UseGuards } from '@nestjs/common';
import { NumeroBidonService } from './numero_bidon.service';
// import { QueryNumeroBidonDto } from './dto/query-numero-bidon.dto';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';

@Controller('numero-bidon')
export class NumeroBidonController {
  constructor(private readonly numeroBidonService: NumeroBidonService) {}

  // @UseGuards(JwtAuthGuard, UserExistsGuard)
  // @Post('query')
  // queryNumeroBidon(@Body() dto: QueryNumeroBidonDto) {
  //   return this.numeroBidonService.queryNumeroBidon(dto);
  // }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('v2/query')
  queryNumeroBidonV2(
    @Body() complexQueryDto: ComplexQueryDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.numeroBidonService.queryNumeroBidonV2(
      complexQueryDto,
      paginationDto
    );
  }
}
