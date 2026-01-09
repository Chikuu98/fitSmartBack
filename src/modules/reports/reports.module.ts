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

import { MemberReportController } from './controllers/member-report.controller';
import { MemberReportService } from './services/member-report.service';

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
    ]),
  ],
  controllers: [MemberReportController],
  providers: [MemberReportService],
  exports: [MemberReportService],
})
export class ReportsModule {}
