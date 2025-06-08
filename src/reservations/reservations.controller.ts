// file: src/reservations/reservations.controller.ts
import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationDto } from './dtos/reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class ReservationsController {
  constructor(private readonly resService: ReservationsService) {}

  // Client reservation endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Post('api/client/reservations')
  async create(@Request() req, @Body() dto: ReservationDto) {
    const userId = req.user.userId;
    const { hotelId, roomId, dateStart, dateEnd } = dto;
    return this.resService.addReservation({ userId, hotelId, roomId, dateStart: new Date(dateStart), dateEnd: new Date(dateEnd) });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Get('api/client/reservations')
  async list(@Request() req) {
    const userId = req.user.userId;
    return this.resService.getReservations({ userId, dateStart: new Date(0), dateEnd: new Date('9999-12-31') });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Delete('api/client/reservations/:id')
  async cancel(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    // verify ownership
    const reservations = await this.resService.getReservations({ userId, dateStart: new Date(0), dateEnd: new Date('9999-12-31') });
    if (!reservations.find(r => r._id.toString() === id)) {
      throw new ForbiddenException();
    }
    return this.resService.removeReservation(id);
  }

  // Manager reservation endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Get('api/manager/reservations/:userId')
  async managerList(@Param('userId') uid: string) {
    return this.resService.getReservations({ userId: uid, dateStart: new Date(0), dateEnd: new Date('9999-12-31') });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Delete('api/manager/reservations/:id')
  async managerCancel(@Param('id') id: string) {
    return this.resService.removeReservation(id);
  }
}
