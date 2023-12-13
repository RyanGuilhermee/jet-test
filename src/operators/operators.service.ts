import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import {
  IOperatorsRepository,
  OperatorsRepository,
} from '../repositories/operators.repository';

@Injectable()
export class OperatorsService implements IOperatorsRepository {
  constructor(private operatorsRepository: OperatorsRepository) {}

  async create(createOperatorDto: CreateOperatorDto) {
    const operator = this.findOneByName(createOperatorDto.name);

    if (operator) {
      throw new ConflictException('Operator name already exists');
    }

    return this.operatorsRepository.create(createOperatorDto);
  }

  findAll() {
    return this.operatorsRepository.findAll();
  }

  async findOne(id: string) {
    const operator = await this.operatorsRepository.findOne(id);

    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    return operator;
  }

  findOneByName(name: string) {
    return this.operatorsRepository.findOneByName(name);
  }

  async update(id: string, updateOperatorDto: UpdateOperatorDto) {
    await this.findOne(id);

    const operator = this.findOneByName(updateOperatorDto.name);

    if (operator) {
      throw new ConflictException('Operator name already exists');
    }

    return this.operatorsRepository.update(id, updateOperatorDto);
  }

  async remove(id: string) {
    const operator = await this.findOne(id);

    if (operator.customers.length) {
      throw new BadRequestException(
        'Unable to remove the operator because there are currently active customers',
      );
    }

    return this.operatorsRepository.remove(id);
  }
}
