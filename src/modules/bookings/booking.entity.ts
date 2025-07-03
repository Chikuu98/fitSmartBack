import { User } from '@/core/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { MentorTimeSlot } from '../mentorSlots/slots/mentor_time_slot.entity';
import { BookingPayment } from '@/modules/bookings/booking_payments/booking_payment.entity';

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'member_id' })
  member: User;

  @ManyToOne(() => MentorTimeSlot, { eager: true })
  @JoinColumn({ name: 'mentor_slot_id' })
  mentorSlot: MentorTimeSlot;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  google_meet_link: string;

  @OneToOne(() => BookingPayment, (bookingPayment) => bookingPayment.booking, {
    eager: true,
    cascade: true,
  })
  bookingPayment: BookingPayment;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
