import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOperatorDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
