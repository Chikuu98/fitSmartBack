import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { BookingService } from '@/modules/bookings/booking.service';
import { CreateBookingDto } from '@/modules/bookings/dto/create-booking.dto';
import { UpdateBookingDto } from '@/modules/bookings/dto/update-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@/common/guards/roles.guard';
import { User, UserRole } from '@/core/users/user.entity';
import { Roles } from '@/common/decorators/roles.decorator';
import { AcceptBookingDto } from './dto/accept-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @Roles(UserRole.MEMBER)
  async create(@Body() createDto: CreateBookingDto, @Req() req: any) {
    return this.bookingService.createBooking(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  async findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get bookings by member ID' })
  @Roles(UserRole.MEMBER)
  async findByMemberId(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.bookingService.findByMemberId(memberId);
  }

  @Get('mentor/:mentorId')
  @ApiOperation({ summary: 'Get bookings by mentor ID' })
  @Roles(UserRole.MENTOR)
  async findByMentorId(@Param('mentorId', ParseIntPipe) mentorId: number) {
    return this.bookingService.findByMentorId(mentorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBookingDto,
  ) {
    return this.bookingService.updateBooking(id, updateDto);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept a booking' })
  @Roles(UserRole.MENTOR)
  async accept(
    @Param('id', ParseIntPipe) id: number,
    @Body() acceptBookingDto: AcceptBookingDto,
  ) {
    return this.bookingService.acceptBooking(
      id,
      acceptBookingDto.google_meet_link,
    );
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR)
  async cancel(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.cancelBooking(id);
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Mark a booking as paid' })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  async markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.markAsPaid(id);
  }
}
