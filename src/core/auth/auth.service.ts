import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/core/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        success: false,
      });
    }

    if (user.status === 'pending_review') {
      throw new UnauthorizedException({
        message: 'Your account is pending admin approval. Please wait for approval to login.',
        success: false,
      });
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedException({
        message: 'Your account has been suspended. Please contact support.',
        success: false,
      });
    }

    if (user.status === 'banned') {
      throw new UnauthorizedException({
        message: 'Your account has been banned. Please contact support.',
        success: false,
      });
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
      message: 'Login successful',
      success: true,
    };
  }
}
