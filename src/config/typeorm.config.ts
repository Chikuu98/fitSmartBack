import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '@/core/users/user.entity';
import { MemberDetails } from '@/core/users/members/member_details.entity';
import { MentorDetails } from '@/core/users/mentors/mentor_details.entity';
import { MentorTimeSlot } from '@/modules/mentorSlots/slots/mentor_time_slot.entity';
import { Booking } from '@/modules/bookings/booking.entity';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [User, MemberDetails, MentorDetails, MentorTimeSlot, Booking],
  synchronize: false,
});
