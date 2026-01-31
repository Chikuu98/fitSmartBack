import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class AcceptPlanDto {
  @ApiProperty({ 
    description: 'Custom name for the plan',
    example: 'My Summer Fitness Journey',
    required: false
  })
  @IsOptional()
  @IsString()
  plan_name?: string;

  @ApiProperty({ 
    description: 'Start date for the plan (YYYY-MM-DD)',
    example: '2025-07-10'
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({ 
    description: 'Specific goal for this plan period',
    example: 'Lose 3kg and improve cardiovascular fitness'
  })
  @IsString()
  target_goal: string;

  @ApiProperty({ 
    description: 'Initial weight in kg',
    example: 75.5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  initial_weight?: number;

  @ApiProperty({ 
    description: 'Target weight in kg',
    example: 72.0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  target_weight?: number;
}

export class PlanResponseDto {
  @ApiProperty({ description: 'Generated plan ID' })
  id: number;

  @ApiProperty({ description: 'Plan type ID' })
  plan_type_id: number;

  @ApiProperty({ description: 'Plan duration in days' })
  duration_days: number;

  @ApiProperty({ description: 'Generation status' })
  status: string;

  @ApiProperty({ description: 'AI response containing the plan' })
  ai_response: any;

  @ApiProperty({ description: 'Generation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Whether plan is accepted', required: false })
  is_accepted?: boolean;

  @ApiProperty({ description: 'Accepted plan details', required: false })
  accepted_plan?: any;
}
