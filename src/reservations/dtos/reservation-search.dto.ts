// file: src/reservations/dtos/reservation-search.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsMongoId } from 'class-validator';

export class ReservationSearchDto {
  @ApiProperty({ example: '64a7f7b9...', description: 'ID пользователя' })
  @IsMongoId()
  userId: string;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Начало периода' })
  @IsDateString()
  dateStart: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Конец периода' })
  @IsDateString()
  dateEnd: string;
}