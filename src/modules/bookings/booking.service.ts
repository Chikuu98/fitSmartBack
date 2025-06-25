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

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(MentorTimeSlot)
    private readonly slotRepo: Repository<MentorTimeSlot>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createBooking(dto: CreateBookingDto, userId: number) {
    const slot = await this.slotRepo.findOne({
      where: { id: dto.mentor_slot_id },
      relations: ['mentor'],
    });

    if (!slot) throw new NotFoundException('Mentor slot not found');
    if (slot.is_booked) throw new BadRequestException('Slot already booked');

    const member = await this.userRepo.findOne({ where: { id: userId } });
    if (!member) throw new NotFoundException('Member not found');

    const booking = this.bookingRepo.create({
      ...dto,
      mentorSlot: slot,
      member,
      status: dto.status || BookingStatus.PENDING,
      payment_status: dto.payment_status || PaymentStatus.UNPAID,
    });

    slot.is_booked = true;
    await this.slotRepo.save(slot);

    await this.bookingRepo.save(booking);
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
      relations: ['mentorSlot', 'member'],
    });
    return {
      success: true,
      data: bookings,
    };
  }

  async findByMemberId(memberId: number) {
    const member = await this.userRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    const bookings = await this.bookingRepo.find({
      where: { member },
      relations: ['mentorSlot', 'member'],
    });
    return {
      success: true,
      data: bookings,
    };
  }

  async findByMentorId(mentorId: number) {
    const mentor = await this.userRepo.findOne({ where: { id: mentorId } });
    if (!mentor) throw new NotFoundException('Mentor not found');
    const bookings = await this.bookingRepo.find({
      where: { mentorSlot: { mentor: mentor } },
      relations: ['mentorSlot', 'member'],
    });
    return {
      success: true,
      data: bookings,
    };
  }

  async findOne(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['mentorSlot', 'member'],
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
    return {
      success: true,
      message: 'Booking accepted successfully',
    };
  }

  async cancelBooking(id: number) {
    const bookingResult = await this.findOne(id);
    const booking = bookingResult.data;
    booking.status = BookingStatus.CANCELLED;
    await this.bookingRepo.save(booking);
    return {
      success: true,
      message: 'Booking cancelled successfully',
    };
  }

  async markAsPaid(id: number) {
    const bookingResult = await this.findOne(id);
    const booking = bookingResult.data;
    booking.payment_status = PaymentStatus.PAID;
    await this.bookingRepo.save(booking);
    return {
      success: true,
      message: 'Payment marked as paid successfully',
    };
  }
}
