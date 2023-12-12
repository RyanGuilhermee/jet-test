import { Module } from '@nestjs/common';
import { OperatorsModule } from './operators/operators.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [OperatorsModule, CustomersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
