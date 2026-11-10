import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({
      name: dto.name,
      email: dto.email,
      password,
    });
    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    const valid = user && (await bcrypt.compare(dto.password, user.password));
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildResponse(user);
  }

    async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private async buildResponse(user: User) {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      role: user.role,
    });
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
