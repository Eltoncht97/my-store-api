import * as bcrypt from 'bcrypt';
interface SeedProduct {
  code: string;
  name: string;
  categoryId: ValidCategories;
  costPrice: number;
  price: number;
}

interface SeedClient {
  name: string;
  lastname: string;
  phone: string;
  address: string;
}

interface SeedCategory {
  name: string;
}

type ValidCategories =
  | 'Pañales Bebé'
  | 'Pañales Adulto'
  | 'Perfumeria'
  | 'Accesorios'
  | 'Rodados'
  | 'Juguetería';

interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
}

interface SeedProveedor {
  name: string;
  address: string;
  phone: string;
}

interface SeedData {
  clients: SeedClient[];
  categories: SeedCategory[];
  products: SeedProduct[];
  users: SeedUser[];
  proveedores: SeedProveedor[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'gerente1@email.com',
      fullName: 'Gerencia',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['gerente'],
    },
    {
      email: 'venta1@google.com',
      fullName: 'Venta',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['venta'],
    },
  ],
  proveedores: [
    {
      name: 'Now Tech',
      address: 'JR SALTA 2034',
      phone: '3421234153',
    },
    {
      name: 'Logi Tech',
      address: 'JR SARMIENTO 2034',
      phone: '3421234623',
    },
  ],
  clients: [
    {
      name: 'Elton',
      lastname: 'Chavez',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Facundo',
      lastname: 'Ranzuglia',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Miguel',
      lastname: 'TP',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Florencia',
      lastname: 'Ranz',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Ornella',
      lastname: 'Calderone',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Juan',
      lastname: 'Ramos',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Maria',
      lastname: 'Palacios',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Victor',
      lastname: 'Gionino',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Leonel',
      lastname: 'Messi',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Pablo',
      lastname: 'Beltramone',
      phone: '1234567891',
      address: 'Address 1',
    },
    {
      name: 'Kathy',
      lastname: 'Perez',
      phone: '1234567891',
      address: 'Address 1',
    },
  ],
  categories: [
    {
      name: 'Pañales Bebé',
    },
    {
      name: 'Pañales Adulto',
    },
    {
      name: 'Perfumeria',
    },
    {
      name: 'Accesorios',
    },
    {
      name: 'Rodados',
    },
    {
      name: 'Juguetería',
    },
  ],
  products: [
    {
      code: '20014724',
      name: 'BABYSEC PREMIUM 3D GDEx60 |3 Uni x Bulto|',
      categoryId: 'Pañales Bebé',
      costPrice: 1813.84,
      price: 2195,
    },
    {
      code: '20014450',
      name: 'BABYSEC ULTRA TANGA Gx40 |4 Uni x Bulto|',
      categoryId: 'Pañales Bebé',
      costPrice: 969.48,
      price: 1174,
    },
    {
      code: '32010420',
      name: 'ESTRELLA PAÑAL SUPERPACK Gx68 |2 Uni x Bulto|',
      categoryId: 'Pañales Bebé',
      costPrice: 2291.36,
      price: 2773,
    },
    {
      code: '10012153',
      name: 'HUGGIES EXTRA FLEX Gx120 |1 Uni x Bulto|',
      categoryId: 'Pañales Bebé',
      costPrice: 3392.72,
      price: 4106,
    },
    {
      code: '11015377',
      name: 'PAMPERS CONFORT XTPLUS GDEx110 |2 Uni x Bulto|',
      categoryId: 'Pañales Bebé',
      costPrice: 3250.85,
      price: 3934,
    },
    {
      code: '12905930',
      name: 'BENARE BABY OLEO CALC.x 970ml |6 Uni x Bulto|',
      categoryId: 'Perfumeria',
      costPrice: 393,
      price: 476,
    },
    {
      code: '15049935',
      name: 'EWE OLEO CALCAREO AC.ALMx500ml |12 Uni x Bulto|',
      categoryId: 'Perfumeria',
      costPrice: 458.28,
      price: 555,
    },
    {
      code: '31040101',
      name: 'BABY BASIC OLEO CALC x 500cc |12 Uni x Bulto|',
      categoryId: 'Perfumeria',
      costPrice: 478.49,
      price: 579,
    },
  ],
};
