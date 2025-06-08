import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { IUserService, SearchUserParams } from './interfaces/user-service.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(data: Partial<User> & { passwordHash: string }): Promise<User> {
    const hash = await bcrypt.hash(data.passwordHash, 10);
    const created = new this.userModel({
      ...data,
      passwordHash: hash,
    });
    return created.save();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(params: SearchUserParams): Promise<User[]> {
    const { limit, offset, email, name, contactPhone } = params;
    const filter: any = {};
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (contactPhone)
      filter.contactPhone = { $regex: contactPhone, $options: 'i' };

    return this.userModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .exec();
  }
}
