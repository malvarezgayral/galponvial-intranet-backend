import { Injectable } from '@nestjs/common';

@Injectable()
export class VehiculosService {
  // create(createVehiculoDto: CreateVehiculoDto) {
  //   return 'This action adds a new vehiculo';
  // }

  findAll() {
    return `This action returns all vehiculos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vehiculo`;
  }

  // update(id: number, updateVehiculoDto: UpdateVehiculoDto) {
  //   return `This action updates a #${id} vehiculo`;
  // }

  remove(id: number) {
    return `This action removes a #${id} vehiculo`;
  }
}
