import { CreateCustomerDto } from '../customers/dto/create-customer.dto';
import { UpdateCustomerDto } from '../customers/dto/update-customer.dto';
import { FindCustomerDto } from '../customers/dto/find-customer.dto';
import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

export interface ICustomersRepository {
  create(createCustomerDto: CreateCustomerDto[]): Promise<string>;

  update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<FindCustomerDto>;

  findOne(id: string): Promise<FindCustomerDto>;

  findOneByEmail(email: string): Promise<FindCustomerDto | null>;

  findAll(): Promise<FindCustomerDto[]>;

  remove(id: string): Promise<string>;

  removeAll(): Promise<string>;
}

@Injectable()
export class CustomersRepository
  extends PrismaClient
  implements ICustomersRepository
{
  async create(createCustomerDto: CreateCustomerDto[]): Promise<string> {
    const createCustomers = createCustomerDto.map((customer) => {
      return {
        name: customer.name,
        birth: customer.birth,
        value: customer.value,
        email: customer.email,
        operator_id: customer.operatorId,
      };
    });

    await this.customer.createMany({
      data: createCustomers,
    });

    return 'Customers successfully created';
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<FindCustomerDto> {
    const customer = await this.customer.update({
      where: { id },
      data: {
        name: updateCustomerDto.name,
        birth: updateCustomerDto.birth,
        value: updateCustomerDto.value,
        email: updateCustomerDto.email,
        operator_id: updateCustomerDto.operatorId,
      },
    });

    const customerDto = new FindCustomerDto();
    customerDto.id = customer.id;
    customerDto.name = customer.name;
    customerDto.birth = customer.birth;
    customerDto.value = Number(customer.value);
    customerDto.email = customer.email;
    customerDto.operatorId = customer.operator_id;

    return customerDto;
  }

  async findOne(id: string): Promise<FindCustomerDto | null> {
    const customer = await this.customer.findFirst({
      where: { id },
    });

    if (!customer) {
      return null;
    }

    const customerDto = new FindCustomerDto();
    customerDto.id = customer.id;
    customerDto.name = customer.name;
    customerDto.birth = customer.birth;
    customerDto.value = Number(customer.value);
    customerDto.email = customer.email;
    customerDto.operatorId = customer.operator_id;

    return customerDto;
  }

  async findOneByEmail(email: string): Promise<FindCustomerDto | null> {
    const customer = await this.customer.findFirst({
      where: { email },
    });

    if (!customer) {
      return null;
    }

    const customerDto = new FindCustomerDto();
    customerDto.id = customer.id;
    customerDto.name = customer.name;
    customerDto.birth = customer.birth;
    customerDto.value = Number(customer.value);
    customerDto.email = customer.email;
    customerDto.operatorId = customer.operator_id;

    return customerDto;
  }

  async findAll(): Promise<FindCustomerDto[]> {
    const customers = await this.customer.findMany();

    const customersDto = customers.map((customer) => {
      const customerDto = new FindCustomerDto();
      customerDto.id = customer.id;
      customerDto.name = customer.name;
      customerDto.birth = customer.birth;
      customerDto.value = Number(customer.value);
      customerDto.email = customer.email;
      customerDto.operatorId = customer.operator_id;

      return customerDto;
    });

    return customersDto;
  }

  async remove(id: string): Promise<string> {
    await this.customer.deleteMany({
      where: { id },
    });

    return 'Customer successfully removed';
  }

  async removeAll(): Promise<string> {
    await this.customer.deleteMany();

    return 'All Customers successfully removed';
  }
}
