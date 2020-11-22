import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('Orders')
    private ordersRepository: IOrdersRepository,

    @inject('Products')
    private productsRepository: IProductsRepository,

    @inject('Customers')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not founded');
    }

    const allProducts = await this.productsRepository.findAllById(products);

    if (!allProducts.length) {
      throw new AppError('Could not find any products with the given ids');
    }

    const existentProductsIds = allProducts.map(product => product.id);

    const checkInexistentProducts = products.filter(
      product => !existentProductsIds.includes(product.id),
    );

    if (checkInexistentProducts) {
      throw new AppError(
        `Could not find produc ${checkInexistentProducts[0].id}`,
      );
    }

    const findProductsWithNoQuantityAvailable = products.filter(
      product =>
        allProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (findProductsWithNoQuantityAvailable.length) {
      throw new AppError('error');
    }

    const serealizeProducts = products.map(product => ({
      id: product.id,
      quantity: product.quantity,
      price: allProducts.filter(p => p.id === product.id)[0].price,
    }));

    const orderService = await this.ordersRepository.create({
      customer,
      products: serealizeProducts,
    });

    const { order_products } = orderService;

    const orderedProductsQuantiry = order_products.map(product => ({
      id: product.product_id,
      quantity:
        allProducts.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductsQuantiry);

    return orderService;
  }
}

export default CreateOrderService;
