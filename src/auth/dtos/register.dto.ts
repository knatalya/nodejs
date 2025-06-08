// file: src/auth/dtos/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email для регистрации' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'pass123', description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Иван Иванов', description: 'Имя пользователя' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Контактный телефон' })
  @IsString()
  @IsOptional()
  contactPhone?: string;
}