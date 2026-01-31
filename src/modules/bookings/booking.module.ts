import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { User } from '@/core/users/user.entity';
import { MentorTimeSlot } from '../mentorSlots/slots/mentor_time_slot.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingPayment } from './booking_payments/booking_payment.entity';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User, MentorTimeSlot, BookingPayment]),
    RatingsModule,
  ],
  providers: [BookingService],
  controllers: [BookingController],
})
export class BookingModule {}
