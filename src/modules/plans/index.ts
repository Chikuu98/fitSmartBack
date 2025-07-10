// Plan Type and Generation
export { PlanType } from './entities/plan-type.entity';
export { GeneratedPlan, GenerationStatus } from './entities/generated-plan.entity';
export { AcceptedPlan, AcceptedPlanStatus } from './entities/accepted-plan.entity';

// Workout Entities
export { WorkoutPlan, DifficultyLevel } from './entities/workout-plan.entity';
export { WorkoutExercise } from './entities/workout-exercise.entity';
export { WorkoutProgress, WorkoutStatus } from './entities/workout-progress.entity';

// Meal Entities
export { MealPlan } from './entities/meal-plan.entity';
export { MealItem, MealType } from './entities/meal-item.entity';
export { MealProgress, MealStatus, HungerLevel, FullnessLevel } from './entities/meal-progress.entity';

// Progress Tracking
export { 
  DailyProgress, 
  EnergyLevel, 
  Mood, 
  SleepQuality, 
  StressLevel 
} from './entities/daily-progress.entity';

// Feedback and Analytics
export { 
  PlanFeedback, 
  GoalAchievement, 
  ChangeLevel 
} from './entities/plan-feedback.entity';
export { PlanAnalytics, ImprovementTrend } from './entities/plan-analytics.entity';
export { UserPreferences, DifficultyPreference } from './entities/user-preferences.entity';

// Enhanced Member Details
export { ActivityLevel } from '@/core/users/members/member_detail.entity';
