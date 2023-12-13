import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
  CustomersRepository,
  ICustomersRepository,
} from '../repositories/customers.repository';
import * as csv from 'fast-csv';
import * as fs from 'fs';

@Injectable()
export class CustomersService implements ICustomersRepository {
  constructor(private customersRepository: CustomersRepository) {}

  private processFile(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      const csvData = [];
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

          csvData.push(row);
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

  async validateData(file: Express.Multer.File) {
    try {
      const data = await this.processFile(file);

      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  create(createCustomerDto: CreateCustomerDto) {
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
}
