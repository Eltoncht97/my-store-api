import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdenesPagoService } from './ordenes-pago.service';
import { CreateOrdenesPagoDto } from './dto/create-ordenes-pago.dto';
import { UpdateOrdenesPagoDto } from './dto/update-ordenes-pago.dto';

@Controller('ordenes-pago')
export class OrdenesPagoController {
  constructor(private readonly ordenesPagoService: OrdenesPagoService) {}

  @Post()
  create(@Body() createOrdenesPagoDto: CreateOrdenesPagoDto) {
    return this.ordenesPagoService.create(createOrdenesPagoDto);
  }

  @Get()
  findAll() {
    return this.ordenesPagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenesPagoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrdenesPagoDto: UpdateOrdenesPagoDto) {
    return this.ordenesPagoService.update(+id, updateOrdenesPagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordenesPagoService.remove(+id);
  }
}
