import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { FitnessLevel } from '@/core/users/members/member_detail.entity';

export class GeneratePlanDto {
  @ApiProperty({ 
    description: 'Duration of the plan in days', 
    example: 7,
    default: 7 
  })
  @IsOptional()
  @IsNumber()
  duration_days?: number = 7;

  @ApiProperty({ 
    description: 'Specific goal for this plan',
    example: 'Lose 5kg in 7 weeks'
  })
  @IsString()
  goal: string;

  @ApiProperty({ 
    description: 'Target weight if applicable',
    example: 70,
    required: false
  })
  @IsOptional()
  @IsNumber()
  target_weight?: number;

  @ApiProperty({ 
    description: 'Include previous plan data for better personalization',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  include_history?: boolean = true;

  @ApiProperty({ 
    description: 'Custom prompt additions',
    required: false
  })
  @IsOptional()
  @IsString()
  custom_prompt?: string;
}

export class PlanGenerationPromptDto {
  @ApiProperty({ description: 'User\'s age' })
  age: number;

  @ApiProperty({ description: 'User\'s gender' })
  gender: string;

  @ApiProperty({ description: 'User\'s height in cm' })
  height: number;

  @ApiProperty({ description: 'User\'s current weight in kg' })
  weight: number;

  @ApiProperty({ description: 'User\'s fitness level', enum: FitnessLevel })
  fitness_level: FitnessLevel;

  @ApiProperty({ description: 'User\'s goal' })
  goal: string;

  @ApiProperty({ description: 'Dietary preferences' })
  dietary_preference: string;

  @ApiProperty({ description: 'Plan duration in days' })
  duration_days: number;

  @ApiProperty({ description: 'Target weight if applicable', required: false })
  target_weight?: number;

  @ApiProperty({ description: 'Previous plan performance data', required: false })
  previous_plan_performance?: any;

  @ApiProperty({ description: 'User preferences', required: false })
  user_preferences?: any;

  @ApiProperty({ description: 'Custom prompt additions', required: false })
  custom_prompt?: string;
}
