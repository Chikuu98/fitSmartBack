import { IsInt, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, PaymentStatus } from '../booking.entity';

export class CreateBookingDto {
  @ApiProperty({
    example: 5,
    description: 'ID of the mentor slot being booked',
  })
  @IsInt()
  mentor_slot_id: number;

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
