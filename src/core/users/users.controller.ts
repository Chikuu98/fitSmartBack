import { Controller, Get, Param, UseGuards, Req, Query, Put, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMemberDetailsDto } from './dto/update-member-details.dto';
import { UpdateMentorDetailsDto } from './dto/update-mentor-details.dto';

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

  @Put('/me')
  @ApiOperation({ 
    summary: 'Update current user profile',
    description: 'Update the basic profile information (users table) of the currently authenticated user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User profile updated successfully' },
        data: { type: 'object', description: 'Updated user profile data' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already in use' })
  async updateMe(
    @Body() updateDto: UpdateUserDto,
    @Req() req: any
  ) {
    return this.usersService.updateUser(req.user.userId, updateDto, req.user);
  }

  @Put('/me/member-details')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ 
    summary: 'Update current member details',
    description: 'Update the member-specific details (member_details table) of the currently authenticated member user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Member details updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Member details updated successfully' },
        data: { type: 'object', description: 'Updated member details data' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data provided or user is not a member' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Member access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateMyMemberDetails(
    @Body() updateDto: UpdateMemberDetailsDto,
    @Req() req: any
  ) {
    return this.usersService.updateMemberDetails(req.user.userId, updateDto, req.user);
  }

  @Put('/me/mentor-details')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ 
    summary: 'Update current mentor details',
    description: 'Update the mentor-specific details (mentor_details table) of the currently authenticated mentor user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Mentor details updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Mentor details updated successfully' },
        data: { type: 'object', description: 'Updated mentor details data' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data provided or user is not a mentor' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Mentor access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateMyMentorDetails(
    @Body() updateDto: UpdateMentorDetailsDto,
    @Req() req: any
  ) {
    return this.usersService.updateMentorDetails(req.user.userId, updateDto, req.user);
  }
}
