// file: src/auth/dtos/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email для входа' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'pass123', description: 'Пароль для входа' })
  @IsString()
  password: string;
}