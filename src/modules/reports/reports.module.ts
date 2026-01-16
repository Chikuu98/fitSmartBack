import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/core/users/user.entity';
import { MemberDetail } from '@/core/users/members/member_detail.entity';
import { AcceptedPlan } from '@/modules/plans/entities/accepted-plan.entity';
import { DailyProgress } from '@/modules/plans/entities/daily-progress.entity';
import { WorkoutProgress } from '@/modules/plans/entities/workout-progress.entity';
import { MealProgress } from '@/modules/plans/entities/meal-progress.entity';
import { Booking } from '@/modules/bookings/booking.entity';
import { MentorTimeSlot } from '@/modules/mentorSlots/slots/mentor_time_slot.entity';
import { WorkoutExercise } from '@/modules/plans/entities/workout-exercise.entity';
import { UserReport } from './entities/user-report.entity';
import { UserPunishment } from './entities/user-punishment.entity';
import { ForumThread } from '@/modules/communityForums/entities/forum-thread.entity';
import { ForumReply } from '@/modules/communityForums/entities/forum-reply.entity';

import { MemberReportController } from './controllers/member-report.controller';
import { UserReportController } from './controllers/user-report.controller';
import { MemberReportService } from './services/member-report.service';
import { UserReportService } from './services/user-report.service';
import { AppLoggerService } from '@/common/services/app-logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      MemberDetail,
      AcceptedPlan,
      DailyProgress,
      WorkoutProgress,
      MealProgress,
      Booking,
      MentorTimeSlot,
      WorkoutExercise,
      UserReport,
      UserPunishment,
      ForumThread,
      ForumReply,
    ]),
  ],
  controllers: [MemberReportController, UserReportController],
  providers: [MemberReportService, UserReportService, AppLoggerService],
  exports: [MemberReportService, UserReportService],
})
export class ReportsModule {}
