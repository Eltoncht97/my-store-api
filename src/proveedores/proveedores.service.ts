import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Proveedor } from './entities/proveedor.entity';
import { ProveedorAccount } from './entities/proveedor-account.entity';
import {
  ProveedorAccountMovement,
  MovimientoProveedorType,
} from './entities/proveedor-account-movement.entity';

@Injectable()
export class ProveedoresService {
  private logger = new Logger();
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(ProveedorAccount)
    private readonly proveedorAccountRepository: Repository<ProveedorAccount>,
    @InjectRepository(ProveedorAccountMovement)
    private readonly proveedorAccountMovementRepository: Repository<ProveedorAccountMovement>,
  ) {}
  async create(createProveedorDto: CreateProveedorDto) {
    try {
      const proveedor = this.proveedorRepository.create({
        ...createProveedorDto,
      });

      const proveedorDB = await this.proveedorRepository.save(proveedor);

      const account = this.proveedorAccountRepository.create({
        proveedor: proveedorDB,
      });

      await this.proveedorAccountRepository.save(account);

      return proveedorDB;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, offset = 0, keyword = '', saldo } = paginationDto;

    const [proveedores, count] = await this.proveedorRepository.findAndCount({
      where: [
        {
          name: Raw((name) => `LOWER(${name}) LIKE LOWER(:value)`, {
            value: `%${keyword}%`,
          }),
          account: {
            saldo: saldo ? Raw((saldo) => `${saldo} != 0`) : null,
          },
        },
      ],
      order: { name: 'ASC' },
      take: limit || null,
      skip: offset,
    });

    return {
      proveedores,
      count,
    };
  }

  async findOne(id: string) {
    let proveedor: Proveedor;
    if (isUUID(id)) {
      proveedor = await this.proveedorRepository.findOne({
        where: { id },
        relations: { account: true },
      });
    }

    if (!proveedor)
      throw new NotFoundException(`Proveedor with "${id}" not found`);

    return proveedor;
  }

  async update(id: string, updateProveedorDto: UpdateProveedorDto) {
    const proveedor = await this.proveedorRepository.preload({
      id,
      ...updateProveedorDto,
    });

    if (!proveedor)
      throw new NotFoundException(`Proveedor with id: ${id} not found`);

    try {
      await this.proveedorRepository.save(proveedor);

      return this.findOne(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const proveedor = await this.findOne(id);

      if (!proveedor)
        throw new NotFoundException(`Proveedor with id: ${id} not found`);

      await this.proveedorRepository.softDelete(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async getProveedoresAccounts(paginationDto: PaginationDto) {
    const { limit, offset = 0 } = paginationDto;

    try {
      const accounts = await this.proveedorAccountRepository.find({
        take: limit || null,
        skip: offset,
        relations: {
          proveedor: true,
        },
      });

      return accounts;
    } catch (error) {
      console.log(error);
    }
  }

  async getAccountById(id: string) {
    let account: ProveedorAccount;

    try {
      if (isUUID(id)) {
        account = await this.proveedorAccountRepository.findOne({
          where: { id },
          relations: { proveedor: true, movimientos: true },
          order: {
            movimientos: {
              createdAt: 'DESC',
            },
          },
        });
      }

      if (!account)
        throw new NotFoundException(`Account for proveedor "${id}" not found`);

      return account;
    } catch (error) {
      console.log(error);
    }
  }

  async getAccountByProveedorId(id: string) {
    let account: ProveedorAccount;

    try {
      if (isUUID(id)) {
        account = await this.proveedorAccountRepository.findOne({
          where: { proveedor: { id } },
          relations: { movimientos: true },
          order: {
            movimientos: {
              createdAt: 'DESC',
            },
          },
        });
      }

      if (!account)
        throw new NotFoundException(`Account for proveedor "${id}" not found`);

      return account;
    } catch (error) {
      console.log(error);
    }
  }

  async createAccountMovement(
    proveedorId: string,
    total: number,
    description: string,
    operationId,
  ) {
    try {
      //crear movimiento de la cuenta del proveedor
      const proveedorAccount = await this.proveedorAccountRepository.findOne({
        where: { proveedor: { id: proveedorId } },
      });

      const movement = this.proveedorAccountMovementRepository.create({
        account: proveedorAccount,
        tipo: MovimientoProveedorType.EFECTIVO,
        description: description,
        monto: total,
        operationId,
      });

      await this.proveedorAccountMovementRepository.save(movement);

      //actualizar saldo de la cuenta
      proveedorAccount.saldo += total;

      await this.proveedorAccountRepository.save(proveedorAccount);
    } catch (error) {
      console.log(error);
    }
  }
}
