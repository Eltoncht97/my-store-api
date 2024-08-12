import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Client } from './entities/client.entity';
import { ClientAccount } from './entities/client-account.entity';
import { ClientAccountMovement } from './entities/client-accoun-movement.entity';

@Injectable()
export class ClientsService {
  private logger = new Logger();
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(ClientAccount)
    private readonly clientAccountRepository: Repository<ClientAccount>,
    @InjectRepository(ClientAccountMovement)
    private readonly clientAccountMovementRepository: Repository<ClientAccountMovement>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    try {
      const client = this.clientRepository.create({
        ...createClientDto,
      });

      const clientDB = await this.clientRepository.save(client);

      const account = this.clientAccountRepository.create({ client: clientDB });

      await this.clientAccountRepository.save(account);

      return client;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, keyword = '', saldo } = paginationDto;

    const [clients, count] = await this.clientRepository.findAndCount({
      where: [
        {
          lastname: Raw((lastname) => `LOWER(${lastname}) LIKE LOWER(:value)`, {
            value: `%${keyword}%`,
          }),
          account: {
            saldo: saldo ? Raw((saldo) => `${saldo} != 0`) : null,
          },
        },
        {
          name: Raw((name) => `LOWER(${name}) LIKE LOWER(:value)`, {
            value: `%${keyword}%`,
          }),
          account: {
            saldo: saldo ? Raw((saldo) => `${saldo} != 0`) : null,
          },
        },
      ],
      order: { lastname: 'ASC' },
      take: limit === 0 ? null : limit,
      skip: offset,
    });

    return {
      clients,
      count,
    };
  }

  async findOnePlain(id: string) {
    let client: Client;
    if (isUUID(id)) {
      client = await this.clientRepository.findOne({
        where: { id },
      });
    }

    if (!client) throw new NotFoundException(`Client with "${id}" not found`);

    return client;
  }

  async findOne(id: string) {
    //this function will return all relationships
    let client: Client;
    if (isUUID(id)) {
      client = await this.clientRepository.findOne({
        where: { id },
        relations: { account: true },
      });
    }

    if (!client) throw new NotFoundException(`Client with "${id}" not found`);

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.clientRepository.preload({
      id,
      ...updateClientDto,
    });

    if (!client) throw new NotFoundException(`Client with id: ${id} not found`);

    try {
      await this.clientRepository.save(client);

      return this.findOne(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const client = await this.findOne(id);

      if (!client)
        throw new NotFoundException(`Client with id: ${id} not found`);

      await this.clientRepository.softDelete(id);
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

  async getAccountClients(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const accounts = await this.clientAccountRepository.find({
      take: limit,
      skip: offset,
      relations: {
        client: true,
      },
    });
    return accounts;
  }

  async getAccountById(id: string) {
    let account: ClientAccount;
    if (isUUID(id)) {
      account = await this.clientAccountRepository.findOne({
        where: { id },
        relations: { client: true, movimientos: true },
        order: {
          movimientos: {
            createdAt: 'DESC',
          },
        },
      });
    }

    if (!account)
      throw new NotFoundException(`Account for client "${id}" not found`);

    return account;
  }

  async deleteAllClients() {
    const query = this.clientRepository.createQueryBuilder('client');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async createClientAccountMovement(
    clientAccount: ClientAccount,
    total: number,
    tipo: string,
    description: string,
  ) {
    try {
      //crear movimiento de la cuenta del cliente
      const movement = this.clientAccountMovementRepository.create({
        account: clientAccount,
        tipo,
        description,
        monto: total,
      });

      await this.clientAccountMovementRepository.save(movement);

      //actualizar saldo de la cuenta
      clientAccount.saldo += total;

      await this.clientAccountRepository.save(clientAccount);
    } catch (error) {
      console.log(error);
    }
  }
}
