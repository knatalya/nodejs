import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Role {
  client  = 'client',
  admin   = 'admin',
  manager = 'manager',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;  // ← добавляем это поле

  @Prop({ required: true })
  name: string;

  @Prop()
  contactPhone?: string;

  @Prop({ required: true, enum: Role, default: Role.client })
  role: Role;            // ← теперь enum, а не строка
}

export const UserSchema = SchemaFactory.createForClass(User);
