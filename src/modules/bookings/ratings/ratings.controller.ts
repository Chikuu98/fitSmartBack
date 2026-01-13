import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/users/user.entity';

@Controller('ratings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @Roles(UserRole.MEMBER)
  create(@Body() createRatingDto: CreateRatingDto, @Request() req) {
    return this.ratingsService.create(createRatingDto, req.user.user_id);
  }

  @Patch(':id')
  @Roles(UserRole.MEMBER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
    @Request() req,
  ) {
    return this.ratingsService.update(id, updateRatingDto, req.user.user_id);
  }

  @Delete(':id')
  @Roles(UserRole.MEMBER)
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ratingsService.delete(id, req.user.user_id);
  }

  @Get('mentor/:mentorId')
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  findByMentor(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.ratingsService.findByMentor(mentorId, page, limit);
  }

  @Get('member/my-ratings')
  @Roles(UserRole.MEMBER)
  findMyRatings(
    @Request() req,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.ratingsService.findByMember(req.user.user_id, page, limit);
  }

  @Get('booking/:bookingId')
  @Roles(UserRole.MEMBER, UserRole.MENTOR)
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.ratingsService.findByBooking(bookingId);
  }

  @Get('mentor/:mentorId/average')
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  getMentorAverageRating(@Param('mentorId', ParseIntPipe) mentorId: number) {
    return this.ratingsService.getMentorAverageRating(mentorId);
  }
}
