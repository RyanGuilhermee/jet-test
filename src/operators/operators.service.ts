import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { CreateCustomerDto } from '../customers/dto/create-customer.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import {
  IOperatorsRepository,
  OperatorsRepository,
} from '../repositories/operators.repository';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class OperatorsService implements IOperatorsRepository {
  constructor(
    @Inject(forwardRef(() => CustomersService))
    private customersService: CustomersService,
    private operatorsRepository: OperatorsRepository,
  ) {}

  async create(createOperatorDto: CreateOperatorDto) {
    const operator = await this.findOneByName(createOperatorDto.name);

    if (operator) {
      throw new ConflictException('Operator name already exists');
    }

    const message = await this.operatorsRepository.create(createOperatorDto);

    this.redistributesWhenInsertingOperators();

    return message;
  }

  async redistributesWhenInsertingOperators() {
    const operators = await this.findAll();

    if (!(operators.length > 1)) {
      return;
    }

    const customers = await this.customersService.findAll();

    const newCustomers = customers.map((customer) => {
      const createCustomerDto = new CreateCustomerDto();
      createCustomerDto.name = customer.name;
      createCustomerDto.birth = customer.birth;
      createCustomerDto.value = customer.value;
      createCustomerDto.email = customer.email;
      createCustomerDto.operatorId = '';

      return createCustomerDto;
    });

    this.customersService.removeAll();

    const distributedCustomers = this.customersService.distributesCustomers(
      newCustomers,
      operators,
    );

    this.customersService.create(distributedCustomers);
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

    const operator = await this.findOneByName(updateOperatorDto.name);

    if (operator) {
      throw new ConflictException('Operator name already exists');
    }

    return this.operatorsRepository.update(id, updateOperatorDto);
  }

  async remove(id: string) {
    const operator = await this.findOne(id);

    for await (const customer of operator.customers) {
      await this.customersService.remove(customer.id);
    }

    const message = await this.operatorsRepository.remove(id);

    const operators = await this.findAll();

    if (operators.length > 1) {
      const redistributedCustomers =
        this.customersService.redistributesWhenInsertingCustomers(
          operator.customers,
          operators,
        );

      this.customersService.create(redistributedCustomers);
    }

    return message;
  }
}
