// src/hotels/controllers/admin-hotel-rooms.controller.ts
import { Controller, Post, Put, Param, Body, UploadedFiles, UseInterceptors, UseGuards } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { HotelRoomsService } from '../rooms.service';
import { CreateRoomDto } from '../dtos/create-room.dto';
import { UpdateRoomDto } from '../dtos/update-room.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('api/admin/hotel-rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminHotelRoomsController {
  constructor(private readonly roomsService: HotelRoomsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images[]'))
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateRoomDto,
  ) {
    const images = files.map(f => f.filename);
    return this.roomsService.create({
      hotel: new Types.ObjectId(dto.hotel),
      description: dto.description,
      images,
    });
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('images[]'))
  update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UpdateRoomDto & { images?: string[] },
  ) {
    const uploaded = files.map(f => f.filename);
    const images = [...(dto.images || []), ...uploaded];
    return this.roomsService.update(id, { images });
  }
}
