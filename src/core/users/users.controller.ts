import { Controller, Get, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';

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

  @Get('/mentors/filter')
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
  @ApiQuery({ name: 'language', required: false, description: 'Filter by language' })
  async findMentors(
    @Query('country') country?: string,
    @Query('language') language?: string,
    @Req() req?: any
  ) {
    return this.usersService.findMentorsWithFilter(country, language, req.user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }
}
