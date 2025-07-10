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
import { PlanType } from '@/modules/plans/entities/plan-type.entity';
import { GeneratedPlan } from '@/modules/plans/entities/generated-plan.entity';
import { AcceptedPlan } from '@/modules/plans/entities/accepted-plan.entity';
import { WorkoutPlan } from '@/modules/plans/entities/workout-plan.entity';
import { WorkoutExercise } from '@/modules/plans/entities/workout-exercise.entity';
import { MealPlan } from '@/modules/plans/entities/meal-plan.entity';
import { MealItem } from '@/modules/plans/entities/meal-item.entity';
import { DailyProgress } from '@/modules/plans/entities/daily-progress.entity';
import { WorkoutProgress } from '@/modules/plans/entities/workout-progress.entity';
import { MealProgress } from '@/modules/plans/entities/meal-progress.entity';
import { PlanFeedback } from '@/modules/plans/entities/plan-feedback.entity';
import { PlanAnalytics } from '@/modules/plans/entities/plan-analytics.entity';
import { UserPreferences } from '@/modules/plans/entities/user-preferences.entity';

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
  ],
  synchronize: false,
});
