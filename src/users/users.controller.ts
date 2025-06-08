// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('api/admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create({
      email: dto.email,
      passwordHash: dto.password,
      name: dto.name,
      contactPhone: dto.contactPhone,
      role: dto.role,
    });
  }

  @Get()
  async findAll(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('email') email?: string,
    @Query('name') name?: string,
    @Query('contactPhone') contactPhone?: string,
  ) {
    return this.usersService.findAll({ limit, offset, email, name, contactPhone });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}