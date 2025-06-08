// file: src/reservations/schemas/reservation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Reservation extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Hotel' })
  hotelId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'HotelRoom' })
  roomId: Types.ObjectId;

  @Prop({ required: true })
  dateStart: Date;

  @Prop({ required: true })
  dateEnd: Date;
}
export const ReservationSchema = SchemaFactory.createForClass(Reservation);
