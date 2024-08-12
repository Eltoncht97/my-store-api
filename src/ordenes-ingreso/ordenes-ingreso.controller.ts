import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrdenesIngresoService } from './ordenes-ingreso.service';
import { CreateOrdenesIngresoDto } from './dto/create-ordenes-ingreso.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('ordenes-ingreso')
export class OrdenesIngresoController {
  constructor(private readonly ordenesIngresoService: OrdenesIngresoService) {}

  @Post()
  create(@Body() createOrdenesIngresoDto: CreateOrdenesIngresoDto) {
    return this.ordenesIngresoService.create(createOrdenesIngresoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ordenesIngresoService.findAll(paginationDto);
  }

  @Get('/report-compras')
  getInformeOrdenesDeIngreso(@Query() query) {
    return this.ordenesIngresoService.getInformeOrdenesDeIngreso(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenesIngresoService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordenesIngresoService.remove(id);
  }
}
