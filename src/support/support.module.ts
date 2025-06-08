// file: src/support/support.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SupportRequest, SupportRequestSchema } from './schemas/support-request.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { SupportService } from './support.service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: SupportRequest.name, schema: SupportRequestSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}