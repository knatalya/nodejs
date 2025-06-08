import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    const valid = await bcrypt.compare(pass, user.passwordHash);
    if (!valid) throw new UnauthorizedException();

    // user — mongoose Document, toObject() доступен
    const obj = user.toObject();
    delete obj.passwordHash;
    return obj;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    contactPhone?: string;
  }) {
    const exists = await this.usersService
      .findByEmail(data.email)
      .catch(() => null);
    if (exists)
      throw new UnauthorizedException('Email already in use');

    const user = await this.usersService.create({
      email: data.email,
      passwordHash: data.password,
      name: data.name,
      contactPhone: data.contactPhone,
      role: Role.client,   // ← используем enum
    });

    const obj = user.toObject();
    delete obj.passwordHash;
    return obj;
  }
}
