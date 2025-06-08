// file: src/support/schemas/message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Message extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ required: true })
  sentAt: Date;

  @Prop({ required: true })
  text: string;

  @Prop()
  readAt?: Date;
}
export const MessageSchema = SchemaFactory.createForClass(Message);