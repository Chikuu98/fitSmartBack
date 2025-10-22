import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { PlanType } from './entities/plan-type.entity';
import { GeneratedPlan } from './entities/generated-plan.entity';
import { AcceptedPlan } from './entities/accepted-plan.entity';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { WorkoutExercise } from './entities/workout-exercise.entity';
import { MealPlan } from './entities/meal-plan.entity';
import { MealItem } from './entities/meal-item.entity';
import { DailyProgress } from './entities/daily-progress.entity';
import { WorkoutProgress } from './entities/workout-progress.entity';
import { MealProgress } from './entities/meal-progress.entity';
import { PlanFeedback } from './entities/plan-feedback.entity';
import { PlanAnalytics } from './entities/plan-analytics.entity';
import { UserPreferences } from './entities/user-preferences.entity';

// Controllers
import { PlansController } from './controllers/plans.controller';
import { ProgressController } from './controllers/progress.controller';
import { AnalyticsController } from './controllers/analytics.controller';

// Services
import { PlansService } from './services/plans.service';
import { GeminiService } from './services/gemini.service';

import { AnalyticsService } from './services/analytics.service';

// Import User entities for relationships
import { User } from '@/core/users/user.entity';
import { MemberDetail } from '@/core/users/members/member_detail.entity';
import { FeedbackController } from './controllers/feedback.controller';
import { ProgressService } from './services/progress.service';
import { FeedbackService } from './services/feedback.service';
import { UserPreferencesService } from './services/user-preferences.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Plan entities
      PlanType,
      GeneratedPlan,
      AcceptedPlan,
      WorkoutPlan,
      WorkoutExercise,
      MealPlan,
      MealItem,
      DailyProgress,
      WorkoutProgress,
      MealProgress,
      PlanFeedback,
      PlanAnalytics,
      UserPreferences,
      // User entities
      User,
      MemberDetail,
    ]),
  ],
  controllers: [
    PlansController,
    ProgressController,
    FeedbackController,
    AnalyticsController,
  ],
  providers: [
    PlansService,
    GeminiService,
    ProgressService,
    FeedbackService,
    AnalyticsService,
    UserPreferencesService,
  ],
  exports: [
    PlansService,
    ProgressService,
    FeedbackService,
    AnalyticsService,
    UserPreferencesService,
  ],
})
export class PlansModule {}
