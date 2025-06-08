// file: src/hotels/hotels.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from './schemas/hotel.schema';
import { HotelRoom, HotelRoomSchema } from './schemas/hotel-room.schema';
import { HotelsService } from './hotels.service';
import { HotelRoomsService } from './rooms.service';
import { CommonHotelRoomsController } from './controllers/common-hotel-rooms.controller';
import { AdminHotelsController } from './controllers/admin-hotels.controller';
import { AdminHotelRoomsController } from './controllers/admin-hotel-rooms.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
    ]),
  ],
  providers: [HotelsService, HotelRoomsService],
  controllers: [
    CommonHotelRoomsController,
    AdminHotelsController,
    AdminHotelRoomsController,
  ],
  exports: [HotelsService, HotelRoomsService],
})
export class HotelsModule {}