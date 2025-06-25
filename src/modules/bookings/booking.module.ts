import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { User } from '@/core/users/user.entity';
import { MentorTimeSlot } from '../mentorSlots/slots/mentor_time_slot.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, MentorTimeSlot])],
  providers: [BookingService],
  controllers: [BookingController],
})
export class BookingModule {}
