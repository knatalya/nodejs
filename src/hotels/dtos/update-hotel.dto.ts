// src/hotels/dtos/update-hotel.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateHotelDto {
  @ApiPropertyOptional({ description: 'Новое название гостиницы' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Новое описание гостиницы' })
  @IsString()
  @IsOptional()
  description?: string;
}
