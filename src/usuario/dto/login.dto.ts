import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsNumber()
  dni: number;

  @IsNotEmpty()
  @IsString()
  password: string;
}
