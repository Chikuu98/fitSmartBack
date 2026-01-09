export interface WeightProgress {
  startWeight: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
  weightChange: number | null;
  progressToTarget: number | null;
}

export interface WorkoutStats {
  totalExercises: number;
  completedExercises: number;
  skippedExercises: number;
  adherenceRate: number;
  mostFrequentExercises: Array<{ name: string; count: number }>;
}

export interface MealStats {
  totalMeals: number;
  fullyConsumed: number;
  partiallyConsumed: number;
  skipped: number;
  adherenceRate: number;
}

export interface WellnessMetrics {
  averageEnergyLevel: string | null;
  averageMood: string | null;
  averageSleepHours: number | null;
  averageSleepQuality: string | null;
  averageWaterIntake: number | null;
  averageStressLevel: string | null;
  averageSatisfaction: number | null;
}

export interface DailyBreakdown {
  date: string;
  dayNumber: number;
  weight: number | null;
  energyLevel: string | null;
  mood: string | null;
  sleepHours: number | null;
  waterIntake: number | null;
  workoutCompletion: number;
  mealCompletion: number;
  overallSatisfaction: number | null;
}

export interface WeeklyComparison {
  weekNumber: number;
  startDate: string;
  endDate: string;
  averageWeight: number | null;
  workoutAdherence: number;
  mealAdherence: number;
  averageSatisfaction: number | null;
}

export interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  attendanceRate: number;
}

export interface MemberProgressReport {
  reportPeriod: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  generatedAt: string;
  
  memberInfo: {
    userId: number;
    name: string;
    email: string;
    age: number | null;
    height: number | null;
    currentWeight: number | null;
    fitnessLevel: string | null;
    goal: string | null;
  };

  planInfo: {
    planId: number | null;
    planName: string | null;
    startDate: string | null;
    endDate: string | null;
    targetGoal: string | null;
    status: string | null;
    completionPercentage: number | null;
  };

  weightProgress: WeightProgress;
  workoutStats: WorkoutStats;
  mealStats: MealStats;
  wellnessMetrics: WellnessMetrics;
  bookingStats: BookingStats;
  
  dailyBreakdown: DailyBreakdown[];
  
  // Only for monthly reports
  weeklyComparison?: WeeklyComparison[];
  
  summary: {
    totalDaysTracked: number;
    consistencyScore: number;
    overallProgress: string;
    strengths: string[];
    areasForImprovement: string[];
  };
}
