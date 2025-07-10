import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString, IsArray, IsDateString } from 'class-validator';
import { 
  EnergyLevel, 
  Mood, 
  SleepQuality, 
  StressLevel 
} from '../entities/daily-progress.entity';

export class CreateDailyProgressDto {
  @ApiProperty({ 
    description: 'Progress date (YYYY-MM-DD)',
    example: '2025-07-10'
  })
  @IsDateString()
  progress_date: string;

  @ApiProperty({ 
    description: 'Day number in the plan (1-7 for weekly)',
    example: 3
  })
  @IsNumber()
  day_number: number;

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

export class UpdateDailyProgressDto {
  @ApiProperty({ 
    description: 'Current weight in kg',
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
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  overall_satisfaction?: number;
}
