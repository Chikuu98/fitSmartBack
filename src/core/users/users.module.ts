import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { MentorDetail } from './mentors/mentor_detail.entity';
import { Certification } from './mentors/certification.entity';
import { SocialLink } from './mentors/social_link.entity';
import { Rating } from '@/modules/bookings/ratings/rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MentorDetail, Certification, SocialLink, Rating]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
