import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CajasService } from './cajas.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { CreateMovimientoDto } from './dto/create-momvimiento-caja.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreateTraspasoDto } from './dto/create-traspaso.dto';

@Controller('cajas')
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Get('movimientos')
  getInformeCaja(@Body() data, @Query() query) {
    return this.cajasService.getMovimientosCajaByDates(query);
  }

  @Post()
  create(@Body() createCajaDto: CreateCajaDto) {
    return this.cajasService.create(createCajaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cajasService.findAll(paginationDto);
  }

  @Post('movimiento')
  @Auth()
  createMovimiento(
    @Body() createMovimientoDto: CreateMovimientoDto,
    @GetUser() user: User,
  ) {
    console.log(user);
    return this.cajasService.createMovement(user, createMovimientoDto);
  }

  @Get('traspaso')
  traspasoCaja() {
    return this.cajasService.traspasoCaja();
  }

  @Post('traspaso/:emisor/:receptor')
  traspasoEfectivoCajas(
    @Param('emisor') emisor: string,
    @Param('receptor') receptor: string,
    @Body() createTraspasoDto: CreateTraspasoDto,
  ) {
    return this.cajasService.traspasoEfectivoCajas(
      emisor,
      receptor,
      createTraspasoDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cajasService.findOne(+id);
  }
}
