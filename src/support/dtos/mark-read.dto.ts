// file: src/support/dtos/mark-read.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId } from 'class-validator';

export class MarkMessagesAsReadDto {
  @ApiProperty({ example: '64a7f7b9...', description: 'ID запроса поддержки' })
  @IsMongoId()
  supportRequest: string;

  @ApiProperty({ example: '2025-07-01T00:00:00.000Z', description: 'Отметить сообщения до этой даты' })
  @IsDateString()
  createdBefore: string;
}