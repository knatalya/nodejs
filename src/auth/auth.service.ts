import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new UnauthorizedException('Email занят');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await new this.userModel({
      ...dto,
      password: hash,
    }).save();
    return this.signToken(user.id, user.email, user.firstName);
  }

  async signin(dto: SigninDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Неверные данные');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Неверные данные');
    return this.signToken(user.id, user.email, user.firstName);
  }

  private signToken(id: string, email: string, firstName: string) {
    const payload = { id, email, firstName };
    return { access_token: this.jwtService.sign(payload) };
  }
}
