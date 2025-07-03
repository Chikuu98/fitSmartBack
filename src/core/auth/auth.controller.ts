import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '@/core/auth/auth.service';
import { UsersService } from '@/core/users/users.service';
import { LoginDto } from '@/core/auth/dto/login.dto';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@/core/users/user.entity';
import { CreateMemberDto } from '@/core/users/dto/create-member.dto';
import { CreateMentorDto } from '@/core/users/dto/create-mentor.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register/member')
  @ApiOperation({ summary: 'Register a new member' })
  @ApiCreatedResponse({ description: 'Member registered successfully.' })
  @ApiBody({ type: CreateMemberDto })
  createMember(@Body() createMemberDto: CreateMemberDto) {
    return this.usersService.createMember(createMemberDto);
  }

  @Post('register/mentor')
  @ApiOperation({ summary: 'Register a new mentor' })
  @ApiCreatedResponse({ description: 'Mentor registered successfully.' })
  @ApiBody({ type: CreateMentorDto })
  createMentor(@Body() createMentorDto: CreateMentorDto) {
    return this.usersService.createMentor(createMentorDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }
}
