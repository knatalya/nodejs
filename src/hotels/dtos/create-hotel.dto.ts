// file: src/hotels/dtos/create-hotel.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({ example: 'Hotel California', description: 'Название гостиницы' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Супер отель у моря', description: 'Описание гостиницы' })
  @IsString()
  @IsOptional()
  description?: string;
}