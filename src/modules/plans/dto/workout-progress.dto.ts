import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { WorkoutStatus } from '../entities/workout-progress.entity';

export class CreateWorkoutProgressDto {
  @ApiProperty({ 
    description: 'Workout exercise ID',
    example: 1
  })
  @IsNumber()
  workout_exercise_id: number;

  @ApiProperty({ 
    description: 'Workout completion status',
    enum: WorkoutStatus,
    default: WorkoutStatus.NOT_STARTED
  })
  @IsOptional()
  @IsEnum(WorkoutStatus)
  status?: WorkoutStatus = WorkoutStatus.NOT_STARTED;

  @ApiProperty({ 
    description: 'Actual duration in minutes',
    example: 25,
    required: false
  })
  @IsOptional()
  @IsNumber()
  actual_duration_minutes?: number;

  @ApiProperty({ 
    description: 'Actual sets performed',
    example: 3,
    required: false
  })
  @IsOptional()
  @IsNumber()
  actual_sets?: number;

  @ApiProperty({ 
    description: 'Actual reps performed per set',
    example: '12,10,8',
    required: false
  })
  @IsOptional()
  @IsString()
  actual_reps?: string;

  @ApiProperty({ 
    description: 'Actual weight used',
    example: '15kg',
    required: false
  })
  @IsOptional()
  @IsString()
  actual_weight?: string;

  @ApiProperty({ 
    description: 'Difficulty rating (1-10)',
    example: 7,
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  difficulty_rating?: number;

  @ApiProperty({ 
    description: 'Enjoyment rating (1-10)',
    example: 8,
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  enjoyment_rating?: number;

  @ApiProperty({ 
    description: 'Calories burned',
    example: 150,
    required: false
  })
  @IsOptional()
  @IsNumber()
  calories_burned?: number;

  @ApiProperty({ 
    description: 'Average heart rate',
    example: 140,
    required: false
  })
  @IsOptional()
  @IsNumber()
  heart_rate_avg?: number;

  @ApiProperty({ 
    description: 'Maximum heart rate',
    example: 165,
    required: false
  })
  @IsOptional()
  @IsNumber()
  heart_rate_max?: number;

  @ApiProperty({ 
    description: 'Exercise notes',
    example: 'Felt strong today, could increase weight next time',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWorkoutProgressDto {
  @ApiProperty({ 
    description: 'Workout completion status',
    enum: WorkoutStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(WorkoutStatus)
  status?: WorkoutStatus;

  @ApiProperty({ 
    description: 'Actual duration in minutes',
    required: false
  })
  @IsOptional()
  @IsNumber()
  actual_duration_minutes?: number;

  @ApiProperty({ 
    description: 'Actual sets performed',
    required: false
  })
  @IsOptional()
  @IsNumber()
  actual_sets?: number;

  @ApiProperty({ 
    description: 'Actual reps performed per set',
    required: false
  })
  @IsOptional()
  @IsString()
  actual_reps?: string;

  @ApiProperty({ 
    description: 'Actual weight used',
    required: false
  })
  @IsOptional()
  @IsString()
  actual_weight?: string;

  @ApiProperty({ 
    description: 'Difficulty rating (1-10)',
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  difficulty_rating?: number;

  @ApiProperty({ 
    description: 'Enjoyment rating (1-10)',
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  enjoyment_rating?: number;

  @ApiProperty({ 
    description: 'Calories burned',
    required: false
  })
  @IsOptional()
  @IsNumber()
  calories_burned?: number;

  @ApiProperty({ 
    description: 'Average heart rate',
    required: false
  })
  @IsOptional()
  @IsNumber()
  heart_rate_avg?: number;

  @ApiProperty({ 
    description: 'Maximum heart rate',
    required: false
  })
  @IsOptional()
  @IsNumber()
  heart_rate_max?: number;

  @ApiProperty({ 
    description: 'Exercise notes',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
