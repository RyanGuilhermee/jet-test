import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
  CustomersRepository,
  ICustomersRepository,
} from '../repositories/customers.repository';
import { OperatorsService } from '../operators/operators.service';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import { FindOperatorDto } from '../operators/dto/find-operator.dto';

@Injectable()
export class CustomersService implements ICustomersRepository {
  constructor(
    @Inject(forwardRef(() => OperatorsService))
    private operatorsService: OperatorsService,
    private customersRepository: CustomersRepository,
  ) {}

  private processFile(file: Express.Multer.File): Promise<CreateCustomerDto[]> {
    return new Promise((resolve, reject) => {
      const csvData: CreateCustomerDto[] = [];
      let headersValidated = false;

      fs.createReadStream(file.path)
        .pipe(csv.parse({ headers: true }))
        .on('error', (error) => {
          this.removeFile(file.path);

          reject(error);
        })
        .on('data', (row) => {
          if (!headersValidated) {
            const headers = Object.keys(row);

            const headersMatch = this.validateHeadersName(headers);

            if (!headersMatch) {
              this.removeFile(file.path);

              reject(new Error('Invalid headers name'));
            }

            const isValidHeadersOrder =
              this.validateHeadersOrderAndLength(headers);

            if (!isValidHeadersOrder) {
              this.removeFile(file.path);

              reject(new Error('Invalid headers order or length'));
            }

            headersValidated = true;
          }

          const customerDto = new CreateCustomerDto();
          customerDto.name = row.nome;
          customerDto.birth = row.nascimento;
          customerDto.value = row.valor;
          customerDto.email = row['email '].trim();
          customerDto.operatorId = '';

          csvData.push(customerDto);
        })
        .on('end', () => {
          this.removeFile(file.path);
          resolve(csvData);
        });
    });
  }

  private removeFile(path: string) {
    fs.rm(path, (err) => err && console.log(err));
  }

  private validateHeadersName(headers: string[]) {
    const validHeaders = ['nome', 'nascimento', 'valor', 'email'];

    for (const header of headers) {
      if (!validHeaders.includes(header.trim())) return false;
    }

    return true;
  }

  private validateHeadersOrderAndLength(headers: string[]) {
    const validHeaders = ['nome', 'nascimento', 'valor', 'email'];

    if (headers.length !== validHeaders.length) {
      return false;
    }

    for (let i = 0; i < headers.length; i++) {
      if (headers[i].trim() !== validHeaders[i]) {
        return false;
      }
    }

    return true;
  }

  distributesCustomers(
    customersData: CreateCustomerDto[],
    operators: FindOperatorDto[],
  ) {
    let indexOperator = 0;

    for (const i in customersData) {
      customersData[i].operatorId = operators[indexOperator].id;

      indexOperator++;

      indexOperator = indexOperator > operators.length - 1 ? 0 : indexOperator;
    }

    return customersData;
  }

  redistributesWhenInsertingCustomers(
    customersData: CreateCustomerDto[],
    operators: FindOperatorDto[],
  ) {
    const newCostumers: CreateCustomerDto[] = [];
    let indexOperator = 0;
    let actualCustomersQuantity = 0;
    let successorCustomersQuantity = 0;

    while (customersData.length) {
      if (
        (indexOperator === 0 &&
          actualCustomersQuantity ===
            operators[indexOperator].customers.length) ||
        operators.length === 1
      ) {
        let indxOperator = 0;

        for (const i in customersData) {
          customersData[i].operatorId = operators[indxOperator].id;

          newCostumers.push(customersData[i]);

          indxOperator++;

          indxOperator = indxOperator > operators.length - 1 ? 0 : indxOperator;
        }

        return newCostumers;
      }

      if (actualCustomersQuantity === 0) {
        // armazena a quantidade de clientes do atual operador
        actualCustomersQuantity = operators[indexOperator].customers.length;
      }

      // armazena a quantidade de clientes do operador sucessor
      successorCustomersQuantity =
        operators[indexOperator + 1].customers.length;

      // verifica se o operador atual tem mais clientes que o sucessor
      if (actualCustomersQuantity > successorCustomersQuantity) {
        // atribui o primeiro cliente da lista ao sucessor
        const firstCustomer = customersData.shift();
        firstCustomer.operatorId = operators[indexOperator + 1].id;

        newCostumers.push(firstCustomer);
        actualCustomersQuantity = successorCustomersQuantity + 1;
      }

      indexOperator++;

      indexOperator =
        indexOperator === operators.length - 1 ? 0 : indexOperator;
    }

    return newCostumers;
  }

  async validateExistingCustomers(customersData: CreateCustomerDto[]) {
    for await (const customer of customersData) {
      const customerExists = await this.findOneByEmail(customer.email);

      if (customerExists) {
        throw new ConflictException('Customer already exists');
      }
    }
  }

  async validateData(file: Express.Multer.File) {
    const operators = await this.operatorsService.findAll();

    if (!operators.length) {
      this.removeFile(file.path);

      throw new BadRequestException(
        'No operator registered. Register an operator before adding customers',
      );
    }

    let customersData: CreateCustomerDto[];

    try {
      customersData = await this.processFile(file);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const hasCustomers = operators[0].customers.length;
    let responseData: CreateCustomerDto[];

    if (!hasCustomers) {
      responseData = this.distributesCustomers(customersData, operators);
    } else {
      await this.validateExistingCustomers(customersData);

      responseData = this.redistributesWhenInsertingCustomers(
        customersData,
        operators,
      );
    }

    return this.create(responseData);
  }

  create(createCustomerDto: CreateCustomerDto[]) {
    return this.customersRepository.create(createCustomerDto);
  }

  findAll() {
    return this.customersRepository.findAll();
  }

  findOne(id: string) {
    return this.customersRepository.findOne(id);
  }

  findOneByEmail(email: string) {
    return this.customersRepository.findOneByEmail(email);
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return this.customersRepository.update(id, updateCustomerDto);
  }

  remove(id: string) {
    return this.customersRepository.remove(id);
  }

  removeAll(): Promise<string> {
    return this.customersRepository.removeAll();
  }
}
