import { Module } from '@nestjs/common';
import { OperatorsModule } from './operators/operators.module';

@Module({
  imports: [OperatorsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
