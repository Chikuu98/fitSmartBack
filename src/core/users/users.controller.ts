import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';
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
  @ApiOperation({
    summary: 'Get all users',
  })
  @Roles(UserRole.ADMIN)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('/me')
  @ApiOperation({
    summary: 'Get current user profile',
  })
  findMe(@Req() req): Promise<User> {
    return this.usersService.findMe(req.user);
  }

  @Get('/mentors/filter')
  @ApiOperation({
    summary: 'Find mentors with optional country and language filters',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Filter by country',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by language',
  })
  async findMentors(
    @Query('country') country?: string,
    @Query('language') language?: string,
    @Req() req?: any,
  ) {
    return this.usersService.findMentorsWithFilter(country, language, req.user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
  })
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put('/me')
  @ApiOperation({
    summary: 'Update current user profile',
  })
  async updateMe(@Body() updateDto: UpdateUserDto, @Req() req: any) {
    return this.usersService.updateUser(req.user.userId, updateDto, req.user);
  }

  @Put('/member/member-details')
  @Roles(UserRole.MEMBER)
  @ApiOperation({
    summary: 'Update current member details',
  })
  async updateMyMemberDetails(
    @Body() updateDto: UpdateMemberDetailsDto,
    @Req() req: any,
  ) {
    return this.usersService.updateMemberDetails(
      req.user.userId,
      updateDto,
      req.user,
    );
  }

  @Put('/mentor/mentor-details')
  @Roles(UserRole.MENTOR)
  @ApiOperation({
    summary: 'Update current mentor details',
  })
  async updateMyMentorDetails(
    @Body() updateDto: UpdateMentorDetailsDto,
    @Req() req: any,
  ) {
    return this.usersService.updateMentorDetails(
      req.user.userId,
      updateDto,
      req.user,
    );
  }

  @Post('/mentor/certifications')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Add a certification to the current mentor' })
  async addCertification(@Body() dto: CreateCertificationDto, @Req() req: any) {
    return this.usersService.addCertification(req.user.userId, dto);
  }

  @Put('/mentor/certifications/:id')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Update a certification of the current mentor' })
  async updateCertification(
    @Param('id') id: number,
    @Body() dto: UpdateCertificationDto,
    @Req() req: any,
  ) {
    return this.usersService.updateCertification(req.user.userId, id, dto);
  }

  @Post('/mentor/social-links')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Add a social link to the current mentor' })
  async addSocialLink(@Body() dto: CreateSocialLinkDto, @Req() req: any) {
    return this.usersService.addSocialLink(req.user.userId, dto);
  }

  @Put('/mentor/social-links/:id')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Update a social link of the current mentor' })
  async updateSocialLink(
    @Param('id') id: number,
    @Body() dto: UpdateSocialLinkDto,
    @Req() req: any,
  ) {
    return this.usersService.updateSocialLink(req.user.userId, id, dto);
  }
}
