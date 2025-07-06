import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '@/core/users/user.entity';
import { MemberDetail } from '@/core/users/members/member_detail.entity';
import { MentorDetail } from '@/core/users/mentors/mentor_detail.entity';
import { MentorTimeSlot } from '@/modules/mentorSlots/slots/mentor_time_slot.entity';
import { Booking } from '@/modules/bookings/booking.entity';
import { Certification } from '@/core/users/mentors/certification.entity';
import { SocialLink } from '@/core/users/mentors/social_link.entity';
import { BookingPayment } from '@/modules/bookings/booking_payments/booking_payment.entity';
import { ForumType } from '@/modules/communityForums/entities/forum-type.entity';
import { ForumThread } from '@/modules/communityForums/entities/forum-thread.entity';
import { ForumReply } from '@/modules/communityForums/entities/forum-reply.entity';
import { ForumTag } from '@/modules/communityForums/entities/forum-tag.entity';
import { ForumLike } from '@/modules/communityForums/entities/forum-like.entity';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [
    User,
    MemberDetail,
    MentorDetail,
    MentorTimeSlot,
    Booking,
    Certification,
    SocialLink,
    BookingPayment,
    ForumType,
    ForumThread,
    ForumReply,
    ForumTag,
    ForumLike,
  ],
  synchronize: false,
});
