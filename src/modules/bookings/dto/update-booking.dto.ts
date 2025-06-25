import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus, PaymentStatus } from '../booking.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookingDto {
  @ApiPropertyOptional({
    enum: BookingStatus,
    description: 'Status of the booking',
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: 'Payment status of the booking',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @ApiPropertyOptional({
    example: 'https://meet.google.com/xyz-abc',
    description: 'Google Meet link for the session',
  })
  @IsOptional()
  @IsString()
  google_meet_link?: string;
}
