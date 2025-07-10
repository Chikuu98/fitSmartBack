import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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
import { FeedbackService } from '../services/feedback.service';
import { CreatePlanFeedbackDto } from '../dto/plan-feedback.dto';

@ApiTags('Plan Feedback')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post(':acceptedPlanId')
  @ApiOperation({ 
    summary: 'Submit plan feedback',
    description: 'Submit detailed feedback for a completed or ongoing plan'
  })
  @ApiParam({ name: 'acceptedPlanId', description: 'Accepted plan ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Feedback created successfully',
    schema: {
      example: {
        id: 1,
        user: { id: 1 },
        acceptedPlan: { id: 1 },
        overall_rating: 8,
        difficulty_rating: 6,
        enjoyment_rating: 9,
        effectiveness_rating: 7,
        goal_achievement: 'fully_achieved',
        would_recommend: true,
        would_repeat: false,
        most_helpful_aspect: 'The variety of exercises kept me motivated',
        least_helpful_aspect: 'Some meal prep took too long',
        suggested_improvements: 'Add more quick meal options',
        favorite_workouts: [1, 5, 12],
        energy_level_change: 'increased',
        weight_change_kg: -2.5,
        adherence_percentage: 85.5,
        created_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Accepted plan not found' })
  async createFeedback(
    @Request() req,
    @Param('acceptedPlanId', ParseIntPipe) acceptedPlanId: number,
    @Body() createFeedbackDto: CreatePlanFeedbackDto,
  ) {
    return this.feedbackService.createFeedback(
      req.user.user_id,
      acceptedPlanId,
      createFeedbackDto,
    );
  }

  @Get(':acceptedPlanId')
  @ApiOperation({ 
    summary: 'Get feedback for a specific plan',
    description: 'Retrieve feedback for a specific accepted plan'
  })
  @ApiParam({ name: 'acceptedPlanId', description: 'Accepted plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback retrieved successfully',
    schema: {
      example: {
        id: 1,
        overall_rating: 8,
        difficulty_rating: 6,
        enjoyment_rating: 9,
        effectiveness_rating: 7,
        goal_achievement: 'fully_achieved',
        would_recommend: true,
        would_repeat: false,
        most_helpful_aspect: 'The variety of exercises kept me motivated',
        least_helpful_aspect: 'Some meal prep took too long',
        suggested_improvements: 'Add more quick meal options',
        favorite_workouts: [1, 5, 12],
        least_favorite_workouts: [3, 8],
        favorite_meals: [2, 7, 15],
        energy_level_change: 'increased',
        fitness_level_change: 'improved',
        weight_change_kg: -2.5,
        adherence_percentage: 85.5,
        challenges_faced: ['time_management', 'meal_prep'],
        additional_comments: 'Overall great experience, would love more variety',
        created_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Feedback not found' })
  async getFeedback(
    @Request() req,
    @Param('acceptedPlanId', ParseIntPipe) acceptedPlanId: number,
  ) {
    return this.feedbackService.getFeedback(
      req.user.user_id,
      acceptedPlanId,
    );
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all user feedback',
    description: 'Retrieve all feedback submitted by the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User feedback retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          acceptedPlan: {
            id: 1,
            plan_name: 'Summer Fitness Plan',
            generatedPlan: {
              planType: { name: 'Weight Loss' }
            }
          },
          overall_rating: 8,
          effectiveness_rating: 7,
          would_recommend: true,
          created_at: '2025-07-10T10:00:00Z'
        }
      ]
    }
  })
  async getUserFeedback(@Request() req) {
    return this.feedbackService.getUserFeedback(req.user.user_id);
  }

  @Get('stats/summary')
  @ApiOperation({ 
    summary: 'Get user feedback statistics',
    description: 'Get aggregated feedback statistics for learning and analysis'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback statistics retrieved successfully',
    schema: {
      example: {
        totalFeedbacks: 5,
        averageOverallRating: 8.2,
        averageDifficultyRating: 6.4,
        averageEffectivenessRating: 7.8,
        averageEnjoymentRating: 8.6,
        recommendationRate: 80.0,
        repeatRate: 40.0,
        averageAdherence: 82.5,
        commonChallenges: ['time_management', 'meal_prep', 'motivation'],
        mostHelpfulAspects: ['exercise_variety', 'clear_instructions', 'progress_tracking'],
        leastHelpfulAspects: ['meal_prep_time', 'equipment_needs'],
        suggestedImprovements: ['more_quick_meals', 'shorter_workouts', 'better_scheduling']
      }
    }
  })
  async getFeedbackStats(@Request() req) {
    return this.feedbackService.getFeedbackStats(req.user.user_id);
  }

  @Put(':feedbackId')
  @ApiOperation({ 
    summary: 'Update feedback',
    description: 'Update existing feedback for a plan'
  })
  @ApiParam({ name: 'feedbackId', description: 'Feedback ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback updated successfully'
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Feedback not found' })
  async updateFeedback(
    @Request() req,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
    @Body() updateFeedbackDto: Partial<CreatePlanFeedbackDto>,
  ) {
    return this.feedbackService.updateFeedback(
      req.user.user_id,
      feedbackId,
      updateFeedbackDto,
    );
  }

  @Delete(':feedbackId')
  @ApiOperation({ 
    summary: 'Delete feedback',
    description: 'Delete feedback for a plan'
  })
  @ApiParam({ name: 'feedbackId', description: 'Feedback ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback deleted successfully'
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Feedback not found' })
  async deleteFeedback(
    @Request() req,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
  ) {
    await this.feedbackService.deleteFeedback(
      req.user.user_id,
      feedbackId,
    );
    return { message: 'Feedback deleted successfully' };
  }
}
