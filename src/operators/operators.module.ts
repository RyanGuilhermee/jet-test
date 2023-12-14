import { Module } from '@nestjs/common';
import { OperatorsService } from './operators.service';
import { OperatorsController } from './operators.controller';
import { OperatorsRepository } from '../repositories/operators.repository';
import { CustomersService } from '../customers/customers.service';
import { CustomersRepository } from '../repositories/customers.repository';

@Module({
  controllers: [OperatorsController],
  providers: [
    OperatorsService,
    OperatorsRepository,
    CustomersService,
    CustomersRepository,
  ],
})
export class OperatorsModule {}
