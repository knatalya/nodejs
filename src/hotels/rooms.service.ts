// file: src/hotels/rooms.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelRoom } from './schemas/hotel-room.schema';
import { IHotelRoomService, SearchRoomsParams } from './interfaces/hotel-room-service.interface';

@Injectable()
export class HotelRoomsService implements IHotelRoomService {
  constructor(@InjectModel(HotelRoom.name) private roomModel: Model<HotelRoom>) {}

  async create(data: Partial<HotelRoom>): Promise<HotelRoom> {
    const created = new this.roomModel(data);
    return created.save();
  }

  async findById(id: string): Promise<HotelRoom> {
    const room = await this.roomModel.findById(id).exec();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async search(params: SearchRoomsParams): Promise<HotelRoom[]> {
    const { limit, offset, hotel, isEnabled } = params;
    const filter: any = { hotel };
    if (typeof isEnabled === 'boolean') filter.isEnabled = isEnabled;
    return this.roomModel.find(filter).skip(offset).limit(limit).exec();
  }

  async update(id: string, data: Partial<HotelRoom>): Promise<HotelRoom> {
    const room = await this.roomModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }
}