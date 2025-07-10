import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { GoalAchievement } from '../entities/plan-feedback.entity';

export class CreatePlanFeedbackDto {
  @ApiProperty({ 
    description: 'Overall plan rating (1-10)',
    example: 8,
    minimum: 1,
    maximum: 10
  })
  @IsNumber()
  overall_rating: number;

  @ApiProperty({ 
    description: 'How well the plan helped achieve goals',
    enum: GoalAchievement
  })
  @IsEnum(GoalAchievement)
  goal_achievement: GoalAchievement;

  @ApiProperty({ 
    description: 'Would recommend this plan to others',
    example: true
  })
  @IsBoolean()
  would_recommend: boolean;

  @ApiProperty({ 
    description: 'Additional comments about the plan',
    example: 'Overall a great experience, the plan was well-structured and achievable',
    required: false
  })
  @IsOptional()
  @IsString()
  additional_comments?: string;
}

export class PlanFeedbackResponseDto {
  @ApiProperty({ description: 'Feedback ID' })
  id: number;

  @ApiProperty({ description: 'User ID' })
  user_id: number;

  @ApiProperty({ description: 'Accepted plan ID' })
  accepted_plan_id: number;

  @ApiProperty({ description: 'Overall rating' })
  overall_rating: number;

  @ApiProperty({ description: 'Goal achievement level' })
  goal_achievement: GoalAchievement;

  @ApiProperty({ description: 'Would recommend' })
  would_recommend: boolean;

  @ApiProperty({ description: 'Additional comments' })
  additional_comments: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;
}
