// file: src/hotels/dtos/create-room.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: '64a7f7b9...', description: 'ID гостиницы' })
  @IsMongoId()
  hotel: string;

  @ApiPropertyOptional({ example: 'Уютный номер', description: 'Описание комнаты' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Список изображений' })
  @IsArray()
  @IsOptional()
  images?: string[];
}
