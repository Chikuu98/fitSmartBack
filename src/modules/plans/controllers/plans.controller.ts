import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PlansService } from '../services/plans.service';
import { GeneratePlanDto } from '../dto/generate-plan.dto';
import { AcceptPlanDto } from '../dto/accept-plan.dto';

@ApiTags('Plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('generate')
  @ApiOperation({ 
    summary: 'Generate AI-powered workout and meal plans',
    description: 'Generate personalized plans based on user preferences and goals using OpenAI'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Plan generated successfully',
    schema: {
      example: {
        id: 1,
        planType: { id: 1, name: 'Weight Loss', description: '...' },
        goals: ['lose_weight', 'improve_fitness'],
        duration_weeks: 4,
        openai_prompt: 'Create a 4-week weight loss plan...',
        openai_response: { workoutPlan: '...', mealPlan: '...' },
        estimated_cost: 0.05,
        created_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Authentication required' })
  async generatePlan(@Request() req, @Body() generatePlanDto: GeneratePlanDto) {
    const plan = await this.plansService.generatePlan(req.user.id, generatePlanDto);
    return {
      success: true,
      message: 'Plan generated successfully',
      data: plan,
    };
  }

  @Post(':planId/accept')
  @ApiOperation({ 
    summary: 'Accept a generated plan',
    description: 'Accept a generated plan. Status will be "accepted". Use the activate endpoint to make it active.'
  })
  @ApiParam({ name: 'planId', description: 'Generated plan ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Plan accepted successfully',
    schema: {
      example: {
        id: 1,
        user: { id: 1 },
        generatedPlan: { id: 1 },
        plan_name: 'My Summer Fitness Plan',
        start_date: '2025-07-10',
        end_date: '2025-08-07',
        status: 'accepted',
        created_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Generated plan not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Plan already accepted or invalid' })
  async acceptPlan(
    @Request() req,
    @Param('planId', ParseIntPipe) planId: number,
    @Body() acceptPlanDto: AcceptPlanDto,
  ) {
    const acceptedPlan = await this.plansService.acceptPlan(req.user.id, planId, acceptPlanDto);
    return {
      success: true,
      message: 'Plan accepted successfully',
      data: acceptedPlan,
    };
  }

  @Get('generated')
  @ApiOperation({ 
    summary: 'Get user\'s generated plans',
    description: 'Retrieve all AI-generated plans for the authenticated user'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of plans to return (default: 10)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of plans to skip (default: 0)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Generated plans retrieved successfully',
    schema: {
      example: {
        plans: [
          {
            id: 1,
            planType: { id: 1, name: 'Weight Loss' },
            goals: ['lose_weight'],
            duration_weeks: 4,
            estimated_cost: 0.05,
            created_at: '2025-07-10T10:00:00Z',
            accepted: false
          }
        ],
        total: 1,
        limit: 10,
        offset: 0
      }
    }
  })
  async getGeneratedPlans(
    @Request() req,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.plansService.getGeneratedPlans(req.user.id, limit, offset);
  }

  @Get('accepted')
  @ApiOperation({ 
    summary: 'Get user\'s accepted plans',
    description: 'Retrieve all accepted and active plans for the authenticated user'
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by plan status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Accepted plans retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          generatedPlan: { id: 1, planType: { name: 'Weight Loss' } },
          plan_name: 'My Summer Fitness Plan',
          start_date: '2025-07-10',
          end_date: '2025-08-07',
          status: 'active',
          progress_percentage: 25.5,
          created_at: '2025-07-10T10:00:00Z'
        }
      ]
    }
  })
  async getAcceptedPlans(
    @Request() req,
    @Query('status') status?: string,
  ) {
    return this.plansService.getAcceptedPlans(req.user.id, status);
  }

  @Get('generated/:id')
  @ApiOperation({ 
    summary: 'Get specific generated plan',
    description: 'Retrieve detailed information about a specific generated plan'
  })
  @ApiParam({ name: 'id', description: 'Generated plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Generated plan retrieved successfully',
    schema: {
      example: {
        id: 1,
        planType: { id: 1, name: 'Weight Loss', description: '...' },
        goals: ['lose_weight', 'improve_fitness'],
        duration_weeks: 4,
        openai_response: {
          workoutPlan: {
            name: '4-Week Weight Loss Workout',
            description: '...',
            weeks: [/* workout weeks */]
          },
          mealPlan: {
            name: 'Balanced Weight Loss Meals',
            description: '...',
            weeks: [/* meal weeks */]
          }
        },
        created_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Generated plan not found' })
  async getGeneratedPlan(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.plansService.getGeneratedPlan(req.user.id, id);
  }

  @Get('accepted/:id')
  @ApiOperation({ 
    summary: 'Get specific accepted plan',
    description: 'Retrieve detailed information about a specific accepted plan with progress'
  })
  @ApiParam({ name: 'id', description: 'Accepted plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Accepted plan retrieved successfully',
    schema: {
      example: {
        id: 1,
        generatedPlan: { /* generated plan data */ },
        plan_name: 'My Summer Fitness Plan',
        start_date: '2025-07-10',
        end_date: '2025-08-07',
        status: 'active',
        workoutPlan: { /* workout plan details */ },
        mealPlan: { /* meal plan details */ },
        progress_summary: {
          totalDays: 28,
          completedDays: 7,
          completionRate: 25.0,
          streakDays: 3
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Accepted plan not found' })
  async getAcceptedPlan(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.plansService.getAcceptedPlan(req.user.id, id);
  }

  @Delete('generated/:id')
  @ApiOperation({ 
    summary: 'Delete generated plan',
    description: 'Delete a generated plan that hasn\'t been accepted'
  })
  @ApiParam({ name: 'id', description: 'Generated plan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Generated plan deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Generated plan not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot delete accepted plan' })
  async deleteGeneratedPlan(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.plansService.deleteGeneratedPlan(req.user.id, id);
    return { 
      success: true,
      message: 'Generated plan deleted successfully' 
    };
  }

  @Delete('accepted/:id')
  @ApiOperation({ 
    summary: 'Cancel accepted plan',
    description: 'Cancel an active accepted plan and mark it as cancelled'
  })
  @ApiParam({ name: 'id', description: 'Accepted plan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Accepted plan cancelled successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Accepted plan not found' })
  async cancelAcceptedPlan(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.plansService.cancelAcceptedPlan(req.user.id, id);
    return { 
      success: true,
      message: 'Accepted plan cancelled successfully' 
    };
  }

  @Post('accepted/:id/activate')
  @ApiOperation({ 
    summary: 'Activate an accepted plan',
    description: 'Change plan status from accepted to active. Only one plan can be active at a time.'
  })
  @ApiParam({ name: 'id', description: 'Accepted plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plan activated successfully',
    schema: {
      example: {
        success: true,
        message: 'Plan activated successfully',
        data: {
          id: 1,
          plan_name: 'My Summer Fitness Plan',
          status: 'active',
          start_date: '2025-07-10',
          end_date: '2025-08-07',
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Accepted plan not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Plan cannot be activated or another plan is already active' })
  async activatePlan(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.plansService.activatePlan(req.user.id, id);
    return { 
      success: true,
      message: 'Plan activated successfully',
      data: result
    };
  }

  @Post('accepted/:id/pause')
  @ApiOperation({ 
    summary: 'Pause an active plan',
    description: 'Pause an active plan to temporarily stop tracking progress'
  })
  @ApiParam({ name: 'id', description: 'Accepted plan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Plan paused successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Accepted plan not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Only active plans can be paused' })
  async pausePlan(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.plansService.pausePlan(req.user.id, id);
    return { 
      success: true,
      message: 'Plan paused successfully',
      data: result
    };
  }

  @Post('accepted/:id/resume')
  @ApiOperation({ 
    summary: 'Resume a paused plan',
    description: 'Resume a paused plan and change status back to active'
  })
  @ApiParam({ name: 'id', description: 'Accepted plan ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Plan resumed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Accepted plan not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Only paused plans can be resumed or another plan is already active' })
  async resumePlan(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.plansService.resumePlan(req.user.id, id);
    return { 
      success: true,
      message: 'Plan resumed successfully',
      data: result
    };
  }

  @Get('types')
  @ApiOperation({ 
    summary: 'Get available plan types',
    description: 'Retrieve all available plan types for plan generation'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plan types retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          name: 'Weight Loss',
          description: 'Plans focused on losing weight through balanced diet and exercise',
          goals: ['lose_weight', 'improve_fitness', 'build_endurance'],
          typical_duration_weeks: 8,
          difficulty_level: 'beginner'
        },
        {
          id: 2,
          name: 'Muscle Building',
          description: 'Plans focused on building muscle mass and strength',
          goals: ['build_muscle', 'increase_strength'],
          typical_duration_weeks: 12,
          difficulty_level: 'intermediate'
        }
      ]
    }
  })
  async getPlanTypes() {
    return this.plansService.getPlanTypes();
  }
}
