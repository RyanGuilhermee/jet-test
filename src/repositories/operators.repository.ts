import { FindOperatorDto } from '../operators/dto/find-operator.dto';
import { CreateOperatorDto } from '../operators/dto/create-operator.dto';
import { UpdateOperatorDto } from '../operators/dto/update-operator.dto';
import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { FindCustomerDto } from '../customers/dto/find-customer.dto';

export interface IOperatorsRepository {
  create(createOperatorDto: CreateOperatorDto): Promise<FindOperatorDto>;

  update(
    id: string,
    updateOperatorDto: UpdateOperatorDto,
  ): Promise<FindOperatorDto>;

  findOne(id: string): Promise<FindOperatorDto>;

  findOneByName(name: string): Promise<FindOperatorDto | null>;

  findAll(): Promise<FindOperatorDto[]>;

  remove(id: string): Promise<string>;
}

@Injectable()
export class OperatorsRepository
  extends PrismaClient
  implements IOperatorsRepository
{
  async create(createOperatorDto: CreateOperatorDto): Promise<FindOperatorDto> {
    const operator = await this.operator.create({
      data: {
        name: createOperatorDto.name,
      },
    });

    const operatorDto = new FindOperatorDto();
    operatorDto.id = operator.id;
    operatorDto.name = operator.name;

    return operatorDto;
  }

  async update(
    id: string,
    updateOperatorDto: UpdateOperatorDto,
  ): Promise<FindOperatorDto> {
    const operator = await this.operator.update({
      where: { id },
      data: {
        name: updateOperatorDto.name,
      },
    });

    const operatorDto = new FindOperatorDto();
    operatorDto.id = operator.id;
    operatorDto.name = operator.name;

    return operatorDto;
  }

  async findOne(id: string): Promise<FindOperatorDto | null> {
    const operator = await this.operator.findFirst({
      where: { id },
    });

    if (!operator) {
      return null;
    }

    const operatorDto = new FindOperatorDto();
    operatorDto.id = operator.id;
    operatorDto.name = operator.name;

    return operatorDto;
  }

  async findOneByName(name: string): Promise<FindOperatorDto | null> {
    const operator = await this.operator.findFirst({
      where: { name },
    });

    if (!operator) {
      return null;
    }

    const operatorDto = new FindOperatorDto();
    operatorDto.id = operator.id;
    operatorDto.name = operator.name;

    return operatorDto;
  }

  async findAll(): Promise<FindOperatorDto[]> {
    const operators = await this.operator.findMany({
      include: { Customer: true },
    });

    const operatorsDto = operators.map((operator) => {
      const operatorDto = new FindOperatorDto();
      operatorDto.id = operator.id;
      operatorDto.name = operator.name;

      operator.Customer.map((customer) => {
        const customerDto = new FindCustomerDto();
        customerDto.id = customer.id;
        customerDto.name = customer.name;
        customerDto.birth = customer.birth;
        customerDto.value = Number(customer.value);
        customerDto.email = customer.email;

        return customerDto;
      });

      return operatorDto;
    });

    return operatorsDto;
  }

  async remove(id: string): Promise<string> {
    await this.operator.delete({
      where: { id },
    });

    return 'Operator successfully removed';
  }
}
