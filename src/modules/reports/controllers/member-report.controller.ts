import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/users/user.entity';
import { MemberReportService } from '../services/member-report.service';
import { GenerateReportDto } from '../dto/member-report.dto';

@ApiTags('Member Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports/member')
export class MemberReportController {
  private readonly logger = new Logger(MemberReportController.name);

  constructor(private readonly memberReportService: MemberReportService) {}

  @Post('generate')
  @Roles(UserRole.MEMBER)
  @ApiOperation({
    summary: 'Generate member progress report',
    description:
      'Generate a comprehensive weekly or monthly progress report for the authenticated member',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Report generated successfully',
    schema: {
      example: {
        reportPeriod: 'weekly',
        startDate: '2026-01-01',
        endDate: '2026-01-07',
        generatedAt: '2026-01-08T10:00:00Z',
        memberInfo: {
          userId: 1,
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
          height: 175,
          currentWeight: 80,
          fitnessLevel: 'intermediate',
          goal: 'Weight Loss',
        },
        planInfo: {
          planId: 1,
          planName: 'My Fitness Plan',
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          targetGoal: 'Lose 5kg',
          status: 'active',
          completionPercentage: 45.5,
        },
        weightProgress: {
          startWeight: 85,
          currentWeight: 80,
          targetWeight: 75,
          weightChange: -5,
          progressToTarget: 50,
        },
        workoutStats: {
          totalExercises: 21,
          completedExercises: 18,
          skippedExercises: 2,
          adherenceRate: 85.71,
          mostFrequentExercises: [
            { name: 'Push-ups', count: 7 },
            { name: 'Squats', count: 7 },
          ],
        },
        mealStats: {
          totalMeals: 21,
          fullyConsumed: 18,
          partiallyConsumed: 2,
          skipped: 1,
          adherenceRate: 90.48,
        },
        wellnessMetrics: {
          averageEnergyLevel: 'high',
          averageMood: 'good',
          averageSleepHours: 7.5,
          averageSleepQuality: 'good',
          averageWaterIntake: 2.8,
          averageStressLevel: 'low',
          averageSatisfaction: 8.2,
        },
        bookingStats: {
          totalBookings: 2,
          completedBookings: 1,
          upcomingBookings: 1,
          attendanceRate: 50,
        },
        dailyBreakdown: [
          {
            date: '2026-01-01',
            dayNumber: 1,
            weight: 85,
            energyLevel: 'high',
            mood: 'good',
            sleepHours: 7.5,
            waterIntake: 2.5,
            workoutCompletion: 100,
            mealCompletion: 100,
            overallSatisfaction: 8,
          },
        ],
        summary: {
          totalDaysTracked: 7,
          consistencyScore: 88.73,
          overallProgress: 'Excellent',
          strengths: [
            'Excellent workout consistency',
            'Great meal plan adherence',
            'Good hydration habits',
          ],
          areasForImprovement: ['Continue current positive habits'],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member details or plan not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date range or parameters',
  })
  async generateReport(@Request() req, @Body() generateReportDto: GenerateReportDto) {
    try {
      this.logger.log(`Generating ${generateReportDto.period} report for user ${req.user.user_id}`);
      const report = await this.memberReportService.generateReport(
        req.user.user_id,
        generateReportDto,
      );
      this.logger.log(`Report generated successfully for user ${req.user.user_id}`);
      return {
        success: true,
        message: 'Report generated successfully',
        data: report,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate report for user ${req.user.user_id}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to generate report',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
