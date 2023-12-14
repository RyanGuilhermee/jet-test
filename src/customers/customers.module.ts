import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersRepository } from '../repositories/customers.repository';
import { OperatorsService } from '../operators/operators.service';
import { OperatorsRepository } from '../repositories/operators.repository';

@Module({
  controllers: [CustomersController],
  providers: [
    CustomersService,
    CustomersRepository,
    OperatorsService,
    OperatorsRepository,
  ],
})
export class CustomersModule {}
