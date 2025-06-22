import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('/me')
  findMe(@Req() req): Promise<User> {
    return this.usersService.findMe(req.user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }
}
