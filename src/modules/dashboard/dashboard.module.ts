import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '@/core/users/user.entity';
import { Booking } from '../bookings/booking.entity';
import { ForumThread } from '../communityForums/entities/forum-thread.entity';
import { AcceptedPlan } from '../plans/entities/accepted-plan.entity';
import { DailyProgress } from '../plans/entities/daily-progress.entity';
import { WorkoutProgress } from '../plans/entities/workout-progress.entity';
import { MealProgress } from '../plans/entities/meal-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Booking,
      ForumThread,
      AcceptedPlan,
      DailyProgress,
      WorkoutProgress,
      MealProgress,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
