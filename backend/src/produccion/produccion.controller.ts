import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { CreateProduccionDto } from './dto/create-produccion.dto';
import { UpdateProduccionDto } from './dto/update-produccion.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExistsGuard } from 'src/common/guards/user-exists.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterProduccionDto } from './dto/filter-produccion.dto';
import { ComplexQueryDto } from 'src/common/dto/complex-query.dto';
import { CreateManualProduccionDto } from './dto/create-manual-produccion.dto';
import { UserJWT } from 'src/common/types/auth.types';

@Controller('produccion')
export class ProduccionController {
  constructor(private readonly produccionsService: ProduccionService) {}

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post()
  create(
    @Body() createProduccionDto: CreateProduccionDto,
    @Req() req: Request
  ) {
    const userToken = req['user'] as UserJWT;
    return this.produccionsService.createWithTransaction(
      createProduccionDto,
      userToken.uuid
    );
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('manual')
  createManual(
    @Body() createManualProduccionDto: CreateManualProduccionDto,
    @Req() req: Request
  ) {
    const userToken = req['user'] as UserJWT;
    return this.produccionsService.createManualWithTransaction(
      createManualProduccionDto,
      userToken.uuid
    );
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.produccionsService.findAll(paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produccionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProduccionDto: UpdateProduccionDto,
    @GetUser() user
  ) {
    return this.produccionsService.updateWithTransaction(
      id,
      updateProduccionDto,
      user
    );
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('filter')
  filter(
    @Body() dto: FilterProduccionDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.produccionsService.filter(dto, paginationDto);
  }

  @UseGuards(JwtAuthGuard, UserExistsGuard)
  @Post('v2/query')
  queryProduccionV2(
    @Body() complexQueryDto: ComplexQueryDto,
    @Query() paginationDto: PaginationDto
  ) {
    return this.produccionsService.queryProduccionV2(
      complexQueryDto,
      paginationDto
    );
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.produccionsService.remove(+id);
  // }
}
