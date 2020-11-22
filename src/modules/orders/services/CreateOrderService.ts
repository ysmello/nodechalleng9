import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  product_id: string;
  quantity: number;
  price: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    private ordersRepository: IOrdersRepository,
    private productsRepository: IProductsRepository,
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const findedCustomer = await this.customersRepository.findById(customer_id);

    if (!findedCustomer) {
      throw new AppError('Customer not founded');
    }

    const orderService = await this.ordersRepository.create({
      customer: findedCustomer,
      products,
    });

    // await this.productsRepository.create({: orderService});

    return orderService;
  }
}

export default CreateOrderService;
