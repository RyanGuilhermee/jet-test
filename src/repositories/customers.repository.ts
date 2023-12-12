import { CreateCustomerDto } from '../customers/dto/create-customer.dto';
import { UpdateCustomerDto } from '../customers/dto/update-customer.dto';
import { FindCustomerDto } from '../customers/dto/find-customer.dto';
import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

export interface ICustomersRepository {
  create(createCustomerDto: CreateCustomerDto): Promise<FindCustomerDto>;

  update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<FindCustomerDto>;

  findOne(id: string): Promise<FindCustomerDto>;

  findOneByEmail(email: string): Promise<FindCustomerDto | null>;

  findAll(): Promise<FindCustomerDto[]>;

  remove(id: string): Promise<string>;
}

@Injectable()
export class CustomersRepository
  extends PrismaClient
  implements ICustomersRepository
{
  async create(createCustomerDto: CreateCustomerDto): Promise<FindCustomerDto> {
    const customer = await this.customer.create({
      data: {
        name: createCustomerDto.name,
        birth: createCustomerDto.birth,
        value: createCustomerDto.value,
        email: createCustomerDto.email,
        operator_id: createCustomerDto.operatorId,
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
    await this.customer.delete({
      where: { id },
    });

    return 'Customer successfully removed';
  }
}
