import { FindCustomerDto } from '../../customers/dto/find-customer.dto';

export class FindOperatorDto {
  id: string;
  name: string;
  customers: FindCustomerDto[];
}
