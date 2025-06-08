// file: src/hotels/dtos/update-room.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRoomDto {
  @ApiPropertyOptional({ description: 'Новое описание комнаты' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Статус активности комнаты' })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Обновлённый список изображений' })
  @IsArray()
  @IsOptional()
  images?: string[];
}