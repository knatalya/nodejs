// file: src/hotels/controllers/common-hotel-rooms.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { HotelRoomsService } from '../rooms.service';
import { HotelsService } from '../hotels.service';

@Controller('api/common/hotel-rooms')
export class CommonHotelRoomsController {
  constructor(
    private roomsService: HotelRoomsService,
    private hotelsService: HotelsService,
  ) {}

  @Get()
  async search(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('hotel') hotelId: string,
  ) {
    const rooms = await this.roomsService.search({ limit, offset, hotel: hotelId, isEnabled: true });
    return Promise.all(
      rooms.map(async r => ({
        id: r._id,
        description: r.description,
        images: r.images,
        hotel: await this.hotelsService.findById(r.hotel.toString()),
      })),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const r = await this.roomsService.findById(id);
    const h = await this.hotelsService.findById(r.hotel.toString());
    return {
      id: r._id,
      description: r.description,
      images: r.images,
      hotel: { id: h._id, title: h.title, description: h.description },
    };
  }
}
