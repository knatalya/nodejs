// file: src/reservations/reservations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }])],
  providers: [ReservationsService],
  controllers: [ReservationsController],
})
export class ReservationsModule {}