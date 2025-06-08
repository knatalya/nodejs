// file: src/users/dtos/update-user.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../schemas/user.schema';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Новое имя пользователя' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Новый контактный телефон' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Новая роль пользователя', enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
export class UpdateHotelDto  {}