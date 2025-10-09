export interface WorkoutExercise {
  name: string;
  type: string;
  duration_minutes: number;
  sets?: number;
  reps?: number;
  weight?: number;
  muscle_groups: string[];
  calories_burned_estimate: number;
}

export interface DayWorkout {
  day: string;
  workouts: WorkoutExercise[];
}

export interface Meal {
  name: string;
  ingredients: string[]; 
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface DayMeals {
  day: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  };
}

export interface FitnessPlanResponse {
  workout_plan: DayWorkout[];
  meal_plan: DayMeals[];
}
