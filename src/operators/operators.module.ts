import { Module } from '@nestjs/common';
import { OperatorsService } from './operators.service';
import { OperatorsController } from './operators.controller';
import { OperatorsRepository } from '../repositories/operators.repository';

@Module({
  controllers: [OperatorsController],
  providers: [OperatorsService, OperatorsRepository],
})
export class OperatorsModule {}
