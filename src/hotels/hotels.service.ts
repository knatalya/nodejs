// file: src/hotels/hotels.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel } from './schemas/hotel.schema';
import { IHotelService, SearchHotelParams, UpdateHotelParams } from './interfaces/hotel-service.interface';

@Injectable()
export class HotelsService implements IHotelService {
  constructor(@InjectModel(Hotel.name) private hotelModel: Model<Hotel>) {}

  async create(data: Partial<Hotel>): Promise<Hotel> {
    const created = new this.hotelModel(data);
    return created.save();
  }

  async findById(id: string): Promise<Hotel> {
    const hotel = await this.hotelModel.findById(id).exec();
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  async search(params: SearchHotelParams): Promise<Hotel[]> {
    const { limit, offset, title } = params;
    const filter: any = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    return this.hotelModel.find(filter).skip(offset).limit(limit).exec();
  }

  async update(id: string, data: UpdateHotelParams): Promise<Hotel> {
    const hotel = await this.hotelModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }
}