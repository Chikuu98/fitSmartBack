import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptBookingDto {
  @ApiProperty({
    description: 'Google Meet link for the booking',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsString()
  @IsNotEmpty()
  google_meet_link: string;
}
