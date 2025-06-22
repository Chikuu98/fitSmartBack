// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { CreateMemberDto } from '../users/dto/create-member.dto';
import { CreateMentorDto } from '../users/dto/create-mentor.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register/member')
  @ApiCreatedResponse({ description: 'Member registered successfully.' })
  @ApiBody({ type: CreateMemberDto })
  createMember(@Body() createMemberDto: CreateMemberDto): Promise<User> {
    return this.usersService.createMember(createMemberDto);
  }

  @Post('register/mentor')
  @ApiCreatedResponse({ description: 'Mentor registered successfully.' })
  @ApiBody({ type: CreateMentorDto })
  createMentor(@Body() createMentorDto: CreateMentorDto): Promise<User> {
    return this.usersService.createMentor(createMentorDto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }
}
