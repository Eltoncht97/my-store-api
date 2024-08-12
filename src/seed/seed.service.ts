import { Injectable, Logger } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { ClientsService } from '../clients/clients.service';
import { CategoriesService } from '../categories/categories.service';
import { VentasService } from 'src/ventas/ventas.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { Caja } from '../cajas/entities/caja.entity';
import { RecibosService } from '../recibos/recibos.service';
import { ProveedoresService } from '../proveedores/proveedores.service';
import { Proveedor } from '../proveedores/entities/proveedor.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('ProductService');

  constructor(
    private readonly clientsService: ClientsService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly recibosService: RecibosService,
    private readonly ventasService: VentasService,
    private readonly proveedorService: ProveedoresService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    await this.insertUsers();
    await this.insertClients();
    await this.insertProveedores();
    await this.inserNewProducts();
    return `SEED executed`;
  }

  private async deleteTables() {
    await this.recibosService.deleteAllRecibos();
    await this.ventasService.deleteAllVentas();
    await this.clientsService.deleteAllClients();
    await this.categoriesService.deleteAllCategories();
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    const cajas: Caja[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(users);

    dbUsers.forEach((user) => {
      cajas.push(this.cajaRepository.create({ user }));
    });

    await this.cajaRepository.save(cajas);
  }

  private async inserNewProducts() {
    const { products, categories } = initialData;

    const insertPromises = [];
    const insertProductsPromises = [];

    categories.forEach((category) => {
      insertPromises.push(this.categoriesService.create(category));
    });

    await Promise.all(insertPromises);

    products.forEach((product) => {
      insertProductsPromises.push(this.productsService.createWithSeed(product));
    });
    await Promise.all(insertProductsPromises);
  }

  private async insertClients() {
    this.logger.log('Clients seed started...');

    const { clients } = initialData;
    const seedPromises = [];

    clients.forEach(async (client) => {
      seedPromises.push(this.clientsService.create(client));
    });

    await Promise.all(seedPromises);

    this.logger.log('Clients seed completed');
  }

  private async insertProveedores() {
    this.logger.log('Proveedores seed started...');

    const seedProveedores = initialData.proveedores;
    const seedPromises = [];

    seedProveedores.forEach(async (prov) => {
      seedPromises.push(this.proveedorService.create(prov));
    });

    await Promise.all(seedPromises);

    this.logger.log('Proveedores seed completed');
  }
}
