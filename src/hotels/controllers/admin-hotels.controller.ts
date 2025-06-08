// file: src/hotels/controllers/admin-hotels.controller.ts
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HotelsService } from '../hotels.service';
import { CreateHotelDto } from '../dtos/create-hotel.dto';
import { UpdateHotelDto } from '../dtos/update-hotel.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('api/admin/hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminHotelsController {
  constructor(private hotelsService: HotelsService) {}

  @Post()
  create(@Body() dto: CreateHotelDto) {
    return this.hotelsService.create(dto);
  }

  @Get()
  findAll(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('title') title?: string,
  ) {
    return this.hotelsService.search({ limit, offset, title });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHotelDto,
  ) {
    return this.hotelsService.update(id, dto);
  }
}
