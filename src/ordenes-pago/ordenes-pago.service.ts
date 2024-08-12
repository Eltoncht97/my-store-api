import { Injectable } from '@nestjs/common';
import { CreateOrdenesPagoDto } from './dto/create-ordenes-pago.dto';
import { UpdateOrdenesPagoDto } from './dto/update-ordenes-pago.dto';

@Injectable()
export class OrdenesPagoService {
  create(createOrdenesPagoDto: CreateOrdenesPagoDto) {
    return 'This action adds a new ordenesPago';
  }

  findAll() {
    return `This action returns all ordenesPago`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ordenesPago`;
  }

  update(id: number, updateOrdenesPagoDto: UpdateOrdenesPagoDto) {
    return `This action updates a #${id} ordenesPago`;
  }

  remove(id: number) {
    return `This action removes a #${id} ordenesPago`;
  }
}
