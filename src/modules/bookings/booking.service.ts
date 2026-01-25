import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus, PaymentStatus } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { MentorTimeSlot } from '../mentorSlots/slots/mentor_time_slot.entity';
import { User } from '@/core/users/user.entity';
import { BookingPayment } from './booking_payments/booking_payment.entity';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(MentorTimeSlot)
    private readonly slotRepo: Repository<MentorTimeSlot>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(BookingPayment)
    private readonly bookingPaymentRepo: Repository<BookingPayment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createBooking(dto: CreateBookingDto, user_id: number) {
    const slot = await this.slotRepo.findOne({
      where: { id: dto.mentor_slot_id },
      relations: ['mentor'],
    });
    if (!slot) throw new NotFoundException('Mentor slot not found');
    if (slot.is_booked) throw new BadRequestException('Slot already booked');

    const member = await this.userRepo.findOne({ where: { id: user_id } });
    if (!member) throw new NotFoundException('Member not found');

    const booking = this.bookingRepo.create({
      ...dto,
      mentorSlot: slot,
      member,
      status: dto.status || BookingStatus.PENDING,
    });

    slot.is_booked = true;
    await this.slotRepo.save(slot);
    await this.bookingRepo.save(booking);

    const unpaidPayment = new BookingPayment();
    unpaidPayment.booking = booking;
    unpaidPayment.amount = 10;
    unpaidPayment.status = PaymentStatus.UNPAID;
    unpaidPayment.payment_method = '';
    unpaidPayment.transaction_id = '';
    unpaidPayment.currency = 'USD';
    await this.bookingPaymentRepo.save(unpaidPayment);

    await this.notificationsService.notifyNewBookingRequest(
      slot.mentor.id,
      member.name,
      booking.id,
    );

    return {
      success: true,
      message: 'Booking created successfully',
    };
  }

  async updateBooking(id: number, dto: UpdateBookingDto) {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    Object.assign(booking, dto);
    await this.bookingRepo.save(booking);
    return {
      success: true,
      message: 'Booking updated successfully',
    };
  }

  async findAll() {
    const bookings = await this.bookingRepo.find({
      relations: ['mentorSlot', 'member', 'bookingPayment'],
    });
    return {
      success: true,
      data: bookings,
    };
  }

  async findByMemberId(member_id: number) {
    const member = await this.userRepo.findOne({ where: { id: member_id } });
    if (!member) throw new NotFoundException('Member not found');
    const bookings = await this.bookingRepo.find({
      where: { member },
      relations: ['mentorSlot.mentor', 'member', 'bookingPayment'],
    });
    return {
      success: true,
      data: bookings,
    };
  }

  async findByMentorId(mentor_id: number) {
    const mentor = await this.userRepo.findOne({ where: { id: mentor_id } });
    if (!mentor) throw new NotFoundException('Mentor not found');
    const bookings = await this.bookingRepo.find({
      where: { mentorSlot: { mentor: mentor } },
      relations: ['mentorSlot', 'member', 'bookingPayment'],
    });
    return {
      success: true,
      data: bookings,
    };
  }

  async findOne(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['mentorSlot', 'mentorSlot.mentor', 'member', 'bookingPayment'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return {
      success: true,
      data: booking,
    };
  }

  async acceptBooking(id: number, meetLink: string) {
    const bookingResult = await this.findOne(id);
    const booking = bookingResult.data;
    booking.status = BookingStatus.ACCEPTED;
    booking.google_meet_link = meetLink;
    const slot = booking.mentorSlot;
    slot.is_booked = true;
    await this.slotRepo.save(slot);
    await this.bookingRepo.save(booking);

    await this.notificationsService.notifyBookingAccepted(
      booking.member.id,
      slot.mentor.name,
      booking.id,
      meetLink,
    );

    return {
      success: true,
      message: 'Booking accepted successfully',
    };
  }

  async cancelBooking(id: number, cancelledByUserId?: number) {
    const bookingResult = await this.findOne(id);
    const booking = bookingResult.data;
    booking.status = BookingStatus.CANCELLED;
    await this.bookingRepo.save(booking);

    if (cancelledByUserId) {
      const isCancelledByMember = booking.member.id === cancelledByUserId;
      const userToNotify = isCancelledByMember
        ? booking.mentorSlot.mentor.id
        : booking.member.id;
      const cancelledByName = isCancelledByMember
        ? booking.member.name
        : booking.mentorSlot.mentor.name;

      await this.notificationsService.notifyBookingCancelled(
        userToNotify,
        cancelledByName,
        booking.id,
      );
    }

    return {
      success: true,
      message: 'Booking cancelled successfully',
    };
  }

  async processPayment(id: number, paymentData: any) {
    const bookingResult = await this.findOne(id);
    const booking = bookingResult.data;
    
    if (booking.status !== BookingStatus.ACCEPTED) {
      throw new BadRequestException('Booking must be accepted before payment');
    }
    
    const price = 10;

    const paidPayment = await this.bookingPaymentRepo.findOne({
      where: { booking: { id: booking.id }, status: PaymentStatus.PAID },
    });
    if (paidPayment) {
      return {
        success: false,
        message: 'Payment already completed for this booking',
      };
    }

    const unpaidPayment = await this.bookingPaymentRepo.findOne({
      where: { booking: { id: booking.id }, status: PaymentStatus.UNPAID },
      order: { id: 'DESC' },
    });
    
    if (unpaidPayment) {
      unpaidPayment.status = PaymentStatus.PAID;
      unpaidPayment.amount = price;
      unpaidPayment.paid_at = new Date();
      unpaidPayment.payment_method = 'Credit Card';
      unpaidPayment.transaction_id = `txn_${Date.now()}`;
      unpaidPayment.currency = 'USD';
      
      await this.bookingPaymentRepo.save(unpaidPayment);
      
      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          transactionId: unpaidPayment.transaction_id,
          amount: price,
          currency: 'USD'
        }
      };
    }
    
    throw new BadRequestException('No payment record found for this booking');
  }

  async markAsPaid(id: number) {
    const bookingResult = await this.findOne(id);
    const booking = bookingResult.data;
    const price = 1000;

    const paidPayment = await this.bookingPaymentRepo.findOne({
      where: { booking: { id: booking.id }, status: PaymentStatus.PAID },
    });
    if (paidPayment) {
      return {
        success: false,
        message: 'Payment already exists for this booking',
      };
    }

    const unpaidPayment = await this.bookingPaymentRepo.findOne({
      where: { booking: { id: booking.id }, status: PaymentStatus.UNPAID },
      order: { id: 'DESC' },
    });
    if (unpaidPayment) {
      unpaidPayment.status = PaymentStatus.PAID;
      unpaidPayment.amount = price;
      unpaidPayment.paid_at = new Date();
      unpaidPayment.payment_method = 'Stripe';
      unpaidPayment.transaction_id = `txn_${Date.now()}`;
      await this.bookingPaymentRepo.save(unpaidPayment);
      return {
        success: true,
        message: 'Payment marked as paid successfully',
      };
    }
  }

  async completeBooking(id: number) {
    const bookingResult = await this.findOne(id);
    const booking = bookingResult.data;
    
    if (booking.bookingPayment?.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Payment must be completed before marking as complete');
    }
    
    booking.status = BookingStatus.COMPLETED;
    await this.bookingRepo.save(booking);
    
    return {
      success: true,
      message: 'Booking marked as completed successfully',
    };
  }
}
