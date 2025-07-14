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
    description: 'Weight used for strength exercises',
    example: '15kg',
    required: false
  })
  @IsOptional()
  @IsString()
  actual_weight?: string;

  @ApiProperty({ 
    description: 'General notes about the exercise performance',
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
    description: 'Weight used for strength exercises',
    required: false
  })
  @IsOptional()
  @IsString()
  actual_weight?: string;

  @ApiProperty({ 
    description: 'General notes about the exercise performance',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
