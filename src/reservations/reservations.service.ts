// file: src/reservations/reservations.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from './schemas/reservation.schema';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
  ) {}

  async addReservation(data: {
    userId: string;
    hotelId: string;
    roomId: string;
    dateStart: Date;
    dateEnd: Date;
  }): Promise<Reservation> {
    const { roomId, dateStart, dateEnd } = data;
    if (new Date(dateEnd) <= new Date(dateStart)) {
      throw new BadRequestException('dateEnd must be after dateStart');
    }
    // check overlap
    const overlapping = await this.reservationModel.findOne({
      roomId,
      $or: [
        { dateStart: { $lt: dateEnd, $gte: dateStart } },
        { dateEnd: { $lte: dateEnd, $gt: dateStart } },
        { dateStart: { $lte: dateStart }, dateEnd: { $gte: dateEnd } },
      ],
    }).exec();
    if (overlapping) {
      throw new BadRequestException('Room is already booked for given dates');
    }
    const created = new this.reservationModel(data);
    return created.save();
  }

  async removeReservation(id: string): Promise<void> {
    const res = await this.reservationModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Reservation not found');
  }

  async getReservations(filter: { userId: string; dateStart: Date; dateEnd: Date }): Promise<Reservation[]> {
    return this.reservationModel.find({
      userId: filter.userId,
      dateStart: { $gte: filter.dateStart },
      dateEnd: { $lte: filter.dateEnd },
    }).exec();
  }
}
