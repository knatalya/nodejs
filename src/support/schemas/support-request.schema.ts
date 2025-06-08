// src/support/schemas/support-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Message, MessageSchema } from './message.schema';  // ← этот импорт обязательно

@Schema({ timestamps: true })
export class SupportRequest extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];
}

export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest);
