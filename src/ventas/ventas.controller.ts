import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from '../auth/entities/user.entity';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @Auth()
  create(@Body() createVentaDto: CreateVentaDto, @GetUser() user: User) {
    return this.ventasService.create(createVentaDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ventasService.findAll(paginationDto);
  }

  @Get('/report')
  getInformeCaja(@Body() dates, @Query() query) {
    const { startDate, endDate } = dates;

    console.log({ startDate, endDate });

    return this.ventasService.getVentasByDate(query);
  }

  @Get('/report-ventas')
  getInformeVentas(@Query() query) {
    return this.ventasService.getInformeVentas(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVentaDto: UpdateVentaDto) {
    return this.ventasService.update(id, updateVentaDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.ventasService.remove(id, user);
  }
}
