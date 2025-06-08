// file: src/support/dtos/send-message.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsMongoId } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: '64a7f7b9...', description: 'ID запроса поддержки' })
  @IsMongoId()
  supportRequest: string;

  @ApiProperty({ description: 'Текст сообщения' })
  @IsString()
  text: string;
}