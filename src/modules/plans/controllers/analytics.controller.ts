import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from '../services/analytics.service';

@ApiTags('Plan Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('generate/:acceptedPlanId')
  @ApiOperation({ 
    summary: 'Generate analytics for a completed plan',
    description: 'Calculate and store comprehensive analytics for a plan based on progress and feedback'
  })
  @ApiParam({ name: 'acceptedPlanId', description: 'Accepted plan ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Analytics generated successfully',
    schema: {
      example: {
        id: 1,
        acceptedPlan: { id: 1 },
        completion_rate: 85.7,
        workout_completion_rate: 90.0,
        meal_completion_rate: 81.4,
        average_workout_duration: 32.5,
        total_calories_burned: 3420,
        weight_change_kg: -2.3,
        consistency_score: 82.1,
        engagement_score: 76.8,
        improvement_trend: 'improving',
        calculated_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Accepted plan not found' })
  async generateAnalytics(
    @Request() req,
    @Param('acceptedPlanId', ParseIntPipe) acceptedPlanId: number,
  ) {
    return this.analyticsService.generatePlanAnalytics(
      req.user.user_id,
      acceptedPlanId,
    );
  }

  @Get(':acceptedPlanId')
  @ApiOperation({ 
    summary: 'Get analytics for a specific plan',
    description: 'Retrieve calculated analytics for a specific accepted plan'
  })
  @ApiParam({ name: 'acceptedPlanId', description: 'Accepted plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics retrieved successfully',
    schema: {
      example: {
        id: 1,
        acceptedPlan: {
          id: 1,
          plan_name: 'Summer Fitness Plan',
          start_date: '2025-06-10',
          end_date: '2025-07-08'
        },
        completion_rate: 85.7,
        workout_completion_rate: 90.0,
        meal_completion_rate: 81.4,
        average_workout_duration: 32.5,
        total_calories_burned: 3420,
        total_calories_consumed: 45600,
        average_daily_calories: 1628,
        weight_change_kg: -2.3,
        consistency_score: 82.1,
        engagement_score: 76.8,
        improvement_trend: 'improving',
        ai_insights: [
          'Strong workout adherence throughout the plan',
          'Meal consistency improved in the second half',
          'Weight loss exceeded target by 15%'
        ],
        recommendations_for_next_plan: [
          'Increase workout intensity by 10%',
          'Focus on more protein-rich meals',
          'Add 2 rest days per week'
        ],
        calculated_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Analytics not found' })
  async getPlanAnalytics(
    @Request() req,
    @Param('acceptedPlanId', ParseIntPipe) acceptedPlanId: number,
  ) {
    return this.analyticsService.getPlanAnalytics(
      req.user.user_id,
      acceptedPlanId,
    );
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all user analytics',
    description: 'Retrieve analytics for all user plans'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User analytics retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          acceptedPlan: {
            id: 1,
            plan_name: 'Summer Fitness Plan'
          },
          completion_rate: 85.7,
          workout_completion_rate: 90.0,
          meal_completion_rate: 81.4,
          weight_change_kg: -2.3,
          improvement_trend: 'improving',
          calculated_at: '2025-07-10T10:00:00Z'
        }
      ]
    }
  })
  async getUserAnalytics(@Request() req) {
    return this.analyticsService.getUserAnalytics(req.user.user_id);
  }

  @Get('summary/overview')
  @ApiOperation({ 
    summary: 'Get user analytics summary',
    description: 'Get aggregated analytics summary across all user plans'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics summary retrieved successfully',
    schema: {
      example: {
        totalPlans: 3,
        averageCompletion: 82.4,
        averageWorkoutCompletion: 87.3,
        averageMealCompletion: 79.2,
        totalWeightChange: -5.1,
        averageConsistency: 78.9,
        averageEngagement: 72.6
      }
    }
  })
  async getAnalyticsSummary(@Request() req) {
    return this.analyticsService.getUserAnalyticsSummary(req.user.user_id);
  }

  @Delete(':acceptedPlanId')
  @ApiOperation({ 
    summary: 'Delete analytics',
    description: 'Delete analytics for a specific plan (when plan is deleted)'
  })
  @ApiParam({ name: 'acceptedPlanId', description: 'Accepted plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics deleted successfully'
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Analytics not found' })
  async deleteAnalytics(
    @Request() req,
    @Param('acceptedPlanId', ParseIntPipe) acceptedPlanId: number,
  ) {
    await this.analyticsService.deleteAnalytics(
      req.user.user_id,
      acceptedPlanId,
    );
    return { message: 'Analytics deleted successfully' };
  }
}
