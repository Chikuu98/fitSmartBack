import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutStatus } from '../entities/workout-progress.entity';
import { MealStatus } from '../entities/meal-progress.entity';
import { 
  EnergyLevel, 
  Mood, 
  SleepQuality, 
  StressLevel 
} from '../entities/daily-progress.entity';

export class BatchWorkoutProgressItemDto {
  @ApiProperty({ 
    description: 'Workout exercise ID',
    example: 1
  })
  @IsNumber()
  workout_exercise_id: number;

  @ApiProperty({ 
    description: 'Workout completion status',
    enum: WorkoutStatus
  })
  @IsEnum(WorkoutStatus)
  status: WorkoutStatus;

  @ApiProperty({ 
    description: 'Weight used for strength exercises',
    example: '15kg',
    required: false
  })
  @IsOptional()
  @IsString()
  actual_weight?: string;

  @ApiProperty({ 
    description: 'Notes about the exercise performance',
    example: 'Felt strong today',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BatchMealProgressItemDto {
  @ApiProperty({ 
    description: 'Meal item ID',
    example: 1
  })
  @IsNumber()
  meal_item_id: number;

  @ApiProperty({ 
    description: 'Meal consumption status',
    enum: MealStatus
  })
  @IsEnum(MealStatus)
  status: MealStatus;

  @ApiProperty({ 
    description: 'Notes about the meal consumption',
    example: 'Delicious and filling',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DailyMetricsDto {
  @ApiProperty({ 
    description: 'Current weight in kg',
    example: 74.2,
    required: false
  })
  @IsOptional()
  @IsNumber()
  current_weight?: number;

  @ApiProperty({ 
    description: 'Energy level for the day',
    enum: EnergyLevel,
    required: false
  })
  @IsOptional()
  @IsEnum(EnergyLevel)
  energy_level?: EnergyLevel;

  @ApiProperty({ 
    description: 'Overall mood for the day',
    enum: Mood,
    required: false
  })
  @IsOptional()
  @IsEnum(Mood)
  mood?: Mood;

  @ApiProperty({ 
    description: 'Hours of sleep',
    example: 7.5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  sleep_hours?: number;

  @ApiProperty({ 
    description: 'Quality of sleep',
    enum: SleepQuality,
    required: false
  })
  @IsOptional()
  @IsEnum(SleepQuality)
  sleep_quality?: SleepQuality;

  @ApiProperty({ 
    description: 'Water intake in liters',
    example: 2.5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  water_intake_liters?: number;

  @ApiProperty({ 
    description: 'Stress level for the day',
    enum: StressLevel,
    required: false
  })
  @IsOptional()
  @IsEnum(StressLevel)
  stress_level?: StressLevel;

  @ApiProperty({ 
    description: 'Overall satisfaction rating (1-10)',
    example: 8,
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  overall_satisfaction?: number;
}

export class BatchProgressDto {
  @ApiProperty({ 
    description: 'Daily progress ID (if updating existing)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  daily_progress_id?: number;

  @ApiProperty({ 
    description: 'Array of workout progress items',
    type: [BatchWorkoutProgressItemDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchWorkoutProgressItemDto)
  workouts?: BatchWorkoutProgressItemDto[];

  @ApiProperty({ 
    description: 'Array of meal progress items',
    type: [BatchMealProgressItemDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchMealProgressItemDto)
  meals?: BatchMealProgressItemDto[];

  @ApiProperty({ 
    description: 'Daily wellness metrics',
    type: DailyMetricsDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DailyMetricsDto)
  dailyMetrics?: DailyMetricsDto;
}
