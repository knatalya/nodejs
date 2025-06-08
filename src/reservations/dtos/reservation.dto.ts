// file: src/reservations/dtos/reservation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId } from 'class-validator';

export class ReservationDto {
  @ApiProperty({ example: '64a7f7b9...', description: 'ID гостиницы' })
  @IsMongoId()
  hotelId: string;

  @ApiProperty({ example: '64a7f7b9...', description: 'ID комнаты' })
  @IsMongoId()
  roomId: string;

  @ApiProperty({ example: '2025-07-01', description: 'Дата начала брони' })
  @IsDateString()
  dateStart: string;

  @ApiProperty({ example: '2025-07-05', description: 'Дата окончания брони' })
  @IsDateString()
  dateEnd: string;
}