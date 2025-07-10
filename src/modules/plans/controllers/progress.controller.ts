import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from '../services/progress.service';
import { CreateDailyProgressDto, UpdateDailyProgressDto } from '../dto/daily-progress.dto';
import { CreateWorkoutProgressDto } from '../dto/workout-progress.dto';
import { CreateMealProgressDto } from '../dto/meal-progress.dto';

@ApiTags('Progress Tracking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('daily/:acceptedPlanId')
  @ApiOperation({ 
    summary: 'Create daily progress entry',
    description: 'Record daily progress for an accepted plan including weight, mood, energy, etc.'
  })
  @ApiParam({ name: 'acceptedPlanId', description: 'Accepted plan ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Daily progress created successfully',
    schema: {
      example: {
        id: 1,
        user: { id: 1 },
        acceptedPlan: { id: 1 },
        progress_date: '2025-07-10',
        day_number: 3,
        current_weight: 74.2,
        energy_level: 'high',
        mood: 'good',
        sleep_hours: 7.5,
        water_intake_liters: 2.5,
        overall_satisfaction: 8,
        notes: 'Felt great today!',
        created_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Accepted plan not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Progress already exists for this date' })
  async createDailyProgress(
    @Request() req,
    @Param('acceptedPlanId', ParseIntPipe) acceptedPlanId: number,
    @Body() createDailyProgressDto: CreateDailyProgressDto,
  ) {
    return this.progressService.createDailyProgress(
      req.user.user_id,
      acceptedPlanId,
      createDailyProgressDto,
    );
  }

  @Post('workout/:dailyProgressId')
  @ApiOperation({ 
    summary: 'Create workout progress entry',
    description: 'Record progress for a specific workout exercise within a daily progress entry'
  })
  @ApiParam({ name: 'dailyProgressId', description: 'Daily progress ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Workout progress created successfully',
    schema: {
      example: {
        id: 1,
        dailyProgress: { id: 1 },
        workoutExercise: { id: 1 },
        status: 'completed',
        actual_duration_minutes: 25,
        actual_sets: 3,
        actual_reps: '12,10,8',
        actual_weight: '15kg',
        difficulty_rating: 7,
        calories_burned: 150,
        notes: 'Great workout, felt strong',
        created_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  async createWorkoutProgress(
    @Request() req,
    @Param('dailyProgressId', ParseIntPipe) dailyProgressId: number,
    @Body() createWorkoutProgressDto: CreateWorkoutProgressDto,
  ) {
    return this.progressService.createWorkoutProgress(
      req.user.user_id,
      dailyProgressId,
      createWorkoutProgressDto,
    );
  }

  @Post('meal/:dailyProgressId')
  @ApiOperation({ 
    summary: 'Create meal progress entry',
    description: 'Record progress for a specific meal within a daily progress entry'
  })
  @ApiParam({ name: 'dailyProgressId', description: 'Daily progress ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Meal progress created successfully',
    schema: {
      example: {
        id: 1,
        dailyProgress: { id: 1 },
        mealItem: { id: 1 },
        status: 'fully_consumed',
        portion_percentage: 100,
        satisfaction_rating: 9,
        taste_rating: 8,
        hunger_before: 'moderately_hungry',
        hunger_after: 'satisfied',
        notes: 'Delicious and filling',
        created_at: '2025-07-10T10:00:00Z'
      }
    }
  })
  async createMealProgress(
    @Request() req,
    @Param('dailyProgressId', ParseIntPipe) dailyProgressId: number,
    @Body() createMealProgressDto: CreateMealProgressDto,
  ) {
    return this.progressService.createMealProgress(
      req.user.user_id,
      dailyProgressId,
      createMealProgressDto,
    );
  }

  @Get('daily/:acceptedPlanId')
  @ApiOperation({ 
    summary: 'Get daily progress for an accepted plan',
    description: 'Retrieve all daily progress entries for a specific accepted plan'
  })
  @ApiParam({ name: 'acceptedPlanId', description: 'Accepted plan ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daily progress retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          progress_date: '2025-07-10',
          day_number: 3,
          current_weight: 74.2,
          energy_level: 'high',
          mood: 'good',
          overall_satisfaction: 8,
          workoutProgress: [/* workout progress entries */],
          mealProgress: [/* meal progress entries */]
        }
      ]
    }
  })
  async getDailyProgress(
    @Request() req,
    @Param('acceptedPlanId', ParseIntPipe) acceptedPlanId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.progressService.getDailyProgress(
      req.user.user_id,
      acceptedPlanId,
      start,
      end,
    );
  }

  @Get('summary/:acceptedPlanId')
  @ApiOperation({ 
    summary: 'Get progress summary for an accepted plan',
    description: 'Get aggregated progress statistics and summary for a plan'
  })
  @ApiParam({ name: 'acceptedPlanId', description: 'Accepted plan ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Progress summary retrieved successfully',
    schema: {
      example: {
        totalDays: 28,
        completedDays: 20,
        completionRate: 71.43,
        streakDays: 5,
        lastActivity: '2025-07-10T00:00:00Z',
        averageWeight: 73.8,
        weightChange: -1.2,
        averageSatisfaction: 7.8
      }
    }
  })
  async getProgressSummary(
    @Request() req,
    @Param('acceptedPlanId', ParseIntPipe) acceptedPlanId: number,
  ) {
    return this.progressService.getProgressSummary(
      req.user.user_id,
      acceptedPlanId,
    );
  }

  @Get('workout/:dailyProgressId')
  @ApiOperation({ 
    summary: 'Get workout progress for a daily progress entry',
    description: 'Retrieve all workout progress entries for a specific day'
  })
  @ApiParam({ name: 'dailyProgressId', description: 'Daily progress ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Workout progress retrieved successfully'
  })
  async getWorkoutProgress(
    @Request() req,
    @Param('dailyProgressId', ParseIntPipe) dailyProgressId: number,
  ) {
    return this.progressService.getWorkoutProgress(
      req.user.user_id,
      dailyProgressId,
    );
  }

  @Get('meal/:dailyProgressId')
  @ApiOperation({ 
    summary: 'Get meal progress for a daily progress entry',
    description: 'Retrieve all meal progress entries for a specific day'
  })
  @ApiParam({ name: 'dailyProgressId', description: 'Daily progress ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Meal progress retrieved successfully'
  })
  async getMealProgress(
    @Request() req,
    @Param('dailyProgressId', ParseIntPipe) dailyProgressId: number,
  ) {
    return this.progressService.getMealProgress(
      req.user.user_id,
      dailyProgressId,
    );
  }

  @Put('daily/:progressId')
  @ApiOperation({ 
    summary: 'Update daily progress entry',
    description: 'Update an existing daily progress entry'
  })
  @ApiParam({ name: 'progressId', description: 'Daily progress ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daily progress updated successfully'
  })
  async updateDailyProgress(
    @Request() req,
    @Param('progressId', ParseIntPipe) progressId: number,
    @Body() updateDailyProgressDto: UpdateDailyProgressDto,
  ) {
    return this.progressService.updateDailyProgress(
      req.user.user_id,
      progressId,
      updateDailyProgressDto,
    );
  }

  @Delete('daily/:progressId')
  @ApiOperation({ 
    summary: 'Delete daily progress entry',
    description: 'Delete a daily progress entry and all associated workout/meal progress'
  })
  @ApiParam({ name: 'progressId', description: 'Daily progress ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daily progress deleted successfully'
  })
  async deleteDailyProgress(
    @Request() req,
    @Param('progressId', ParseIntPipe) progressId: number,
  ) {
    await this.progressService.deleteDailyProgress(
      req.user.user_id,
      progressId,
    );
    return { message: 'Daily progress deleted successfully' };
  }
}
