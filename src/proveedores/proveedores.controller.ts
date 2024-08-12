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
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.proveedoresService.findAll(paginationDto);
  }

  @Get('accounts')
  getAccountProveedores(@Query() paginationDto: PaginationDto) {
    return this.proveedoresService.getProveedoresAccounts(paginationDto);
  }

  @Get('accounts/:id')
  getProveedorAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedoresService.getAccountById(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedoresService.findOne(id);
  }

  // @Post(':id/add-movement')
  // addAccountMovement(@Body() createAccountMovimientoDto) {
  //   return this.proveedoresService.createAccountMovement(
  //     createAccountMovimientoDto,
  //   );
  // }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedoresService.update(id, updateProveedorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedoresService.remove(id);
  }
}
