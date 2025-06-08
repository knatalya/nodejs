// file: src/users/dtos/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../schemas/user.schema';
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123', description: 'Пароль пользователя' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Иван Иванов', description: 'Имя пользователя' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Телефон пользователя' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ example: Role.client, enum: Role, description: 'Роль пользователя', default: Role.client })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}