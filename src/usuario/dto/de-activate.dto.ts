import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class DeActivateUserDto {
  @IsNotEmpty()
  @IsNumber()
  dni: number;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
