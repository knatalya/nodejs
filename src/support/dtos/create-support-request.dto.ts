// file: src/support/dtos/create-support-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSupportRequestDto {
  @ApiProperty({ description: 'Текст первого сообщения в запросе' })
  @IsString()
  text: string;
}