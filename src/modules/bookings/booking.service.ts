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

  // Create new booking
  async createBooking(dto: CreateBookingDto, userId: number): Promise<Booking> {
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

    return await this.bookingRepo.save(booking);
  }

  // Update booking (used by mentor to accept, reject etc.)
  async updateBooking(id: number, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    Object.assign(booking, dto);
    return await this.bookingRepo.save(booking);
  }

  // Get all bookings
  async findAll(): Promise<Booking[]> {
    return this.bookingRepo.find({ relations: ['slot', 'member'] });
  }

  // Get booking by ID
  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['slot', 'member'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  // Mentor accepts a booking and sets Google Meet link
  async acceptBooking(id: number, meetLink: string): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = BookingStatus.ACCEPTED;
    booking.google_meet_link = meetLink;
    const slot = booking.mentorSlot;
    slot.is_booked = true;
    await this.slotRepo.save(slot);
    return await this.bookingRepo.save(booking);
  }

  // Member cancels booking
  async cancelBooking(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = BookingStatus.CANCELLED;
    return await this.bookingRepo.save(booking);
  }

  // Update payment status
  async markAsPaid(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.payment_status = PaymentStatus.PAID;
    return await this.bookingRepo.save(booking);
  }
}
