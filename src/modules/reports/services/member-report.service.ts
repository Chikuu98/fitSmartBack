import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Logger } from '@nestjs/common';
import { User } from '@/core/users/user.entity';
import { MemberDetail } from '@/core/users/members/member_detail.entity';
import { AcceptedPlan } from '@/modules/plans/entities/accepted-plan.entity';
import { DailyProgress } from '@/modules/plans/entities/daily-progress.entity';
import { WorkoutProgress } from '@/modules/plans/entities/workout-progress.entity';
import { MealProgress } from '@/modules/plans/entities/meal-progress.entity';
import { Booking, BookingStatus } from '@/modules/bookings/booking.entity';
import { MentorTimeSlot } from '@/modules/mentorSlots/slots/mentor_time_slot.entity';
import { WorkoutExercise } from '@/modules/plans/entities/workout-exercise.entity';
import { GenerateReportDto, ReportPeriod } from '../dto/member-report.dto';
import { MemberProgressReport } from '../interfaces/report.interface';

@Injectable()
export class MemberReportService {
  private readonly logger = new Logger(MemberReportService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MemberDetail)
    private memberDetailRepository: Repository<MemberDetail>,
    @InjectRepository(AcceptedPlan)
    private acceptedPlanRepository: Repository<AcceptedPlan>,
    @InjectRepository(DailyProgress)
    private dailyProgressRepository: Repository<DailyProgress>,
    @InjectRepository(WorkoutProgress)
    private workoutProgressRepository: Repository<WorkoutProgress>,
    @InjectRepository(MealProgress)
    private mealProgressRepository: Repository<MealProgress>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(WorkoutExercise)
    private workoutExerciseRepository: Repository<WorkoutExercise>,
  ) {}

  async generateReport(
    userId: number,
    dto: GenerateReportDto,
  ): Promise<MemberProgressReport> {
    try {
      this.logger.log(`Starting report generation for user ${userId}, period: ${dto.period}`);

      const { startDate, endDate } = this.calculateDateRange(dto);
      this.logger.log(`Date range: ${startDate} to ${endDate}`);

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['memberDetail'],
      });

      if (!user) {
        this.logger.error(`User not found: ${userId}`);
        throw new NotFoundException('User not found');
      }

      if (!user.memberDetail) {
        this.logger.error(`Member details not found for user: ${userId}`);
        throw new NotFoundException('Member details not found');
      }

      this.logger.log(`User found: ${user.name} (${user.email})`);

      let acceptedPlan: AcceptedPlan | null = null;
      if (dto.acceptedPlanId) {
        acceptedPlan = await this.acceptedPlanRepository.findOne({
          where: { id: dto.acceptedPlanId, user: { id: userId } },
        });

        if (!acceptedPlan) {
          this.logger.error(`Accepted plan not found: ${dto.acceptedPlanId}`);
          throw new NotFoundException('Accepted plan not found');
        }
        this.logger.log(`Using specified plan: ${acceptedPlan.plan_name}`);
      } else {
        acceptedPlan = await this.acceptedPlanRepository.findOne({
          where: [
            {
              user: { id: userId },
              start_date: LessThanOrEqual(new Date(endDate)),
              end_date: MoreThanOrEqual(new Date(startDate)),
            },
          ],
          order: { created_at: 'DESC' },
        });
        if (acceptedPlan) {
          this.logger.log(`Found active plan: ${acceptedPlan.plan_name}`);
        } else {
          this.logger.warn(`No active plan found for user ${userId} in date range`);
        }
      }

      this.logger.log('Fetching daily progress data...');
      const dailyProgressData = await this.dailyProgressRepository.find({
        where: {
          user: { id: userId },
          progress_date: Between(new Date(startDate), new Date(endDate)),
        },
        relations: ['workoutProgress', 'mealProgress', 'acceptedPlan'],
        order: { progress_date: 'ASC' },
      });
      this.logger.log(`Found ${dailyProgressData.length} days of progress data`);

      this.logger.log('Fetching bookings...');
      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.mentorSlot', 'mentorSlot')
        .leftJoinAndSelect('booking.member', 'member')
        .where('member.id = :userId', { userId })
        .andWhere('mentorSlot.date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getMany();
      this.logger.log(`Found ${bookings.length} bookings`);

      this.logger.log('Building report...');
      const report: MemberProgressReport = {
        reportPeriod: dto.period,
        startDate,
        endDate,
        generatedAt: new Date().toISOString(),

        memberInfo: this.buildMemberInfo(user),
        planInfo: this.buildPlanInfo(acceptedPlan),
        weightProgress: this.calculateWeightProgress(dailyProgressData, acceptedPlan),
        workoutStats: await this.calculateWorkoutStats(dailyProgressData),
        mealStats: this.calculateMealStats(dailyProgressData),
        wellnessMetrics: this.calculateWellnessMetrics(dailyProgressData),
        bookingStats: this.calculateBookingStats(bookings),
        dailyBreakdown: this.buildDailyBreakdown(dailyProgressData, startDate, endDate),
        summary: {
          totalDaysTracked: 0,
          consistencyScore: 0,
          overallProgress: '',
          strengths: [],
          areasForImprovement: [],
        },
      };

      if (dto.period === ReportPeriod.MONTHLY) {
        report.weeklyComparison = this.buildWeeklyComparison(dailyProgressData, startDate, endDate);
      }

      report.summary = this.calculateSummary(report);

      this.logger.log('Report generated successfully');
      return report;
    } catch (error) {
      this.logger.error(`Error generating report: ${error.message}`, error.stack);
      throw error;
    }
  }

  private calculateDateRange(dto: GenerateReportDto): {
    startDate: string;
    endDate: string;
  } {
    let startDate: Date;
    let endDate: Date;

    if (dto.startDate && dto.endDate) {
      startDate = new Date(dto.startDate);
      endDate = new Date(dto.endDate);
    } else if (dto.period === ReportPeriod.WEEKLY) {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 29);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  private buildMemberInfo(user: User): MemberProgressReport['memberInfo'] {
    const memberDetail = user.memberDetail;
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      age: memberDetail?.age || null,
      height: memberDetail?.height || null,
      currentWeight: memberDetail?.weight || null,
      fitnessLevel: memberDetail?.fitness_level || null,
      goal: memberDetail?.goal || null,
    };
  }

  private buildPlanInfo(
    plan: AcceptedPlan | null,
  ): MemberProgressReport['planInfo'] {
    if (!plan) {
      return {
        planId: null,
        planName: null,
        startDate: null,
        endDate: null,
        targetGoal: null,
        status: null,
        completionPercentage: null,
      };
    }

    const planStartDate = typeof plan.start_date === 'string' 
      ? new Date(plan.start_date) 
      : plan.start_date;
    const planEndDate = typeof plan.end_date === 'string'
      ? new Date(plan.end_date)
      : plan.end_date;

    return {
      planId: plan.id,
      planName: plan.plan_name,
      startDate: planStartDate.toISOString().split('T')[0],
      endDate: planEndDate.toISOString().split('T')[0],
      targetGoal: plan.target_goal,
      status: plan.status,
      completionPercentage: Number(plan.completion_percentage),
    };
  }

  private calculateWeightProgress(
    dailyProgressData: DailyProgress[],
    plan: AcceptedPlan | null,
  ): MemberProgressReport['weightProgress'] {
    const weightsRecorded = dailyProgressData
      .filter((d) => d.current_weight !== null)
      .map((d) => Number(d.current_weight));

    const startWeight =
      weightsRecorded.length > 0
        ? weightsRecorded[0]
        : plan?.initial_weight
        ? Number(plan.initial_weight)
        : null;
    const currentWeight =
      weightsRecorded.length > 0
        ? weightsRecorded[weightsRecorded.length - 1]
        : null;
    const targetWeight = plan?.target_weight ? Number(plan.target_weight) : null;

    let weightChange: number | null = null;
    let progressToTarget: number | null = null;

    if (startWeight !== null && currentWeight !== null) {
      weightChange = currentWeight - startWeight;
      weightChange = Math.round(weightChange * 100) / 100;
    }

    if (startWeight !== null && currentWeight !== null && targetWeight !== null) {
      const totalChangeNeeded = targetWeight - startWeight;
      const currentChange = currentWeight - startWeight;
      progressToTarget =
        totalChangeNeeded !== 0 ? (currentChange / totalChangeNeeded) * 100 : 0;
      progressToTarget = Math.round(progressToTarget * 100) / 100;
    }

    return {
      startWeight,
      currentWeight,
      targetWeight,
      weightChange,
      progressToTarget,
    };
  }

  private async calculateWorkoutStats(
    dailyProgressData: DailyProgress[],
  ): Promise<MemberProgressReport['workoutStats']> {
    const allWorkoutProgress = dailyProgressData.flatMap(
      (d) => d.workoutProgress || [],
    );

    const totalExercises = allWorkoutProgress.length;
    const completedExercises = allWorkoutProgress.filter(
      (wp) => wp.status === 'completed',
    ).length;
    const skippedExercises = allWorkoutProgress.filter(
      (wp) => wp.status === 'skipped',
    ).length;

    const adherenceRate =
      totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    const exerciseCounts: { [key: number]: number } = {};
    for (const wp of allWorkoutProgress.filter((wp) => wp.status === 'completed')) {
      const exerciseId = wp.workoutExercise?.id;
      if (exerciseId) {
        exerciseCounts[exerciseId] = (exerciseCounts[exerciseId] || 0) + 1;
      }
    }

    const mostFrequentExercises: Array<{ name: string; count: number }> = [];
    const sortedExerciseIds = Object.entries(exerciseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => parseInt(id));

    for (const exerciseId of sortedExerciseIds) {
      const exercise = await this.workoutExerciseRepository.findOne({
        where: { id: exerciseId },
      });
      if (exercise) {
        mostFrequentExercises.push({
          name: exercise.name,
          count: exerciseCounts[exerciseId],
        });
      }
    }

    return {
      totalExercises,
      completedExercises,
      skippedExercises,
      adherenceRate: Math.round(adherenceRate * 100) / 100,
      mostFrequentExercises,
    };
  }

  private calculateMealStats(
    dailyProgressData: DailyProgress[],
  ): MemberProgressReport['mealStats'] {
    const allMealProgress = dailyProgressData.flatMap(
      (d) => d.mealProgress || [],
    );

    const totalMeals = allMealProgress.length;
    const fullyConsumed = allMealProgress.filter(
      (mp) => mp.status === 'fully_consumed',
    ).length;
    const partiallyConsumed = allMealProgress.filter(
      (mp) => mp.status === 'partially_consumed',
    ).length;
    const skipped = allMealProgress.filter((mp) => mp.status === 'skipped').length;

    const adherenceRate =
      totalMeals > 0
        ? ((fullyConsumed + partiallyConsumed * 0.5) / totalMeals) * 100
        : 0;

    return {
      totalMeals,
      fullyConsumed,
      partiallyConsumed,
      skipped,
      adherenceRate: Math.round(adherenceRate * 100) / 100,
    };
  }

  private calculateWellnessMetrics(
    dailyProgressData: DailyProgress[],
  ): MemberProgressReport['wellnessMetrics'] {
    if (dailyProgressData.length === 0) {
      return {
        averageEnergyLevel: null,
        averageMood: null,
        averageSleepHours: null,
        averageSleepQuality: null,
        averageWaterIntake: null,
        averageStressLevel: null,
        averageSatisfaction: null,
      };
    }

    const energyLevels = dailyProgressData
      .filter((d) => d.energy_level)
      .map((d) => d.energy_level);
    const moods = dailyProgressData.filter((d) => d.mood).map((d) => d.mood);
    const sleepHours = dailyProgressData
      .filter((d) => d.sleep_hours !== null)
      .map((d) => Number(d.sleep_hours));
    const sleepQualities = dailyProgressData
      .filter((d) => d.sleep_quality)
      .map((d) => d.sleep_quality);
    const waterIntakes = dailyProgressData
      .filter((d) => d.water_intake_liters !== null)
      .map((d) => Number(d.water_intake_liters));
    const stressLevels = dailyProgressData
      .filter((d) => d.stress_level)
      .map((d) => d.stress_level);
    const satisfactions = dailyProgressData
      .filter((d) => d.overall_satisfaction !== null)
      .map((d) => d.overall_satisfaction);

    return {
      averageEnergyLevel: this.getMostCommon(energyLevels),
      averageMood: this.getMostCommon(moods),
      averageSleepHours:
        sleepHours.length > 0
          ? Math.round(
              (sleepHours.reduce((sum, h) => sum + h, 0) / sleepHours.length) * 10,
            ) / 10
          : null,
      averageSleepQuality: this.getMostCommon(sleepQualities),
      averageWaterIntake:
        waterIntakes.length > 0
          ? Math.round(
              (waterIntakes.reduce((sum, w) => sum + w, 0) / waterIntakes.length) *
                10,
            ) / 10
          : null,
      averageStressLevel: this.getMostCommon(stressLevels),
      averageSatisfaction:
        satisfactions.length > 0
          ? Math.round(
              (satisfactions.reduce((sum, s) => sum + s, 0) / satisfactions.length) *
                10,
            ) / 10
          : null,
    };
  }

  private calculateBookingStats(
    bookings: Booking[],
  ): MemberProgressReport['bookingStats'] {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    ).length;
    const upcomingBookings = bookings.filter(
      (b) => b.status === BookingStatus.ACCEPTED,
    ).length;

    const attendanceRate =
      totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    return {
      totalBookings,
      completedBookings,
      upcomingBookings,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    };
  }

  private buildDailyBreakdown(
    dailyProgressData: DailyProgress[],
    startDate: string,
    endDate: string,
  ): MemberProgressReport['dailyBreakdown'] {
    const dataByDate = new Map<string, DailyProgress>();
    dailyProgressData.forEach((dp) => {
      const dateStr = (typeof dp.progress_date === 'string' 
        ? new Date(dp.progress_date) 
        : dp.progress_date).toISOString().split('T')[0];
      dataByDate.set(dateStr, dp);
    });

    const allDates: string[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDates.map((dateStr) => {
      const dp = dataByDate.get(dateStr);
      
      if (!dp) {
        return {
          date: dateStr,
          dayNumber: null,
          weight: null,
          energyLevel: null,
          mood: null,
          sleepHours: null,
          waterIntake: null,
          workoutCompletion: 0,
          mealCompletion: 0,
          overallSatisfaction: null,
        };
      }

      const workouts = dp.workoutProgress || [];
      const meals = dp.mealProgress || [];

      const workoutCompletion =
        workouts.length > 0
          ? (workouts.filter((w) => w.status === 'completed').length /
              workouts.length) *
            100
          : 0;

      const mealCompletion =
        meals.length > 0
          ? ((meals.filter((m) => m.status === 'fully_consumed').length +
              meals.filter((m) => m.status === 'partially_consumed').length * 0.5) /
              meals.length) *
            100
          : 0;

      return {
        date: dateStr,
        dayNumber: dp.day_number,
        weight: dp.current_weight ? Number(dp.current_weight) : null,
        energyLevel: dp.energy_level || null,
        mood: dp.mood || null,
        sleepHours: dp.sleep_hours ? Number(dp.sleep_hours) : null,
        waterIntake: dp.water_intake_liters ? Number(dp.water_intake_liters) : null,
        workoutCompletion: Math.round(workoutCompletion * 100) / 100,
        mealCompletion: Math.round(mealCompletion * 100) / 100,
        overallSatisfaction: dp.overall_satisfaction || null,
      };
    });
  }

  private buildWeeklyComparison(
    dailyProgressData: DailyProgress[],
    startDate: string,
    endDate: string,
  ): MemberProgressReport['weeklyComparison'] {
    if (dailyProgressData.length === 0) return [];

    const reportStartDate = new Date(startDate);
    const reportEndDate = new Date(endDate);

    const weekStartDate = new Date(reportStartDate);
    const dayOfWeek = weekStartDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStartDate.setDate(weekStartDate.getDate() - daysToMonday);

    const dataByDate = new Map<string, DailyProgress>();
    dailyProgressData.forEach((dp) => {
      const dateStr = (typeof dp.progress_date === 'string' 
        ? new Date(dp.progress_date) 
        : dp.progress_date).toISOString().split('T')[0];
      dataByDate.set(dateStr, dp);
    });

    const weeks: Array<{
      weekNumber: number;
      startDate: string;
      endDate: string;
      data: DailyProgress[];
    }> = [];

    let weekNumber = 1;
    let currentWeekStart = new Date(weekStartDate);

    while (currentWeekStart <= reportEndDate) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

      const weekData: DailyProgress[] = [];
      const weekDate = new Date(currentWeekStart);
      
      for (let i = 0; i < 7; i++) {
        if (weekDate >= reportStartDate && weekDate <= reportEndDate) {
          const dateStr = weekDate.toISOString().split('T')[0];
          const dp = dataByDate.get(dateStr);
          if (dp) {
            weekData.push(dp);
          }
        }
        weekDate.setDate(weekDate.getDate() + 1);
      }

      if (currentWeekEnd >= reportStartDate && currentWeekStart <= reportEndDate) {
        weeks.push({
          weekNumber,
          startDate: currentWeekStart.toISOString().split('T')[0],
          endDate: currentWeekEnd.toISOString().split('T')[0],
          data: weekData,
        });
        weekNumber++;
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks.map((week) => {
      const weights = week.data
        .filter((d) => d.current_weight !== null)
        .map((d) => Number(d.current_weight));
      const averageWeight =
        weights.length > 0
          ? weights.reduce((sum, w) => sum + w, 0) / weights.length
          : null;

      const allWorkouts = week.data.flatMap((d) => d.workoutProgress || []);
      const workoutAdherence =
        allWorkouts.length > 0
          ? (allWorkouts.filter((w) => w.status === 'completed').length /
              allWorkouts.length) *
            100
          : 0;

      const allMeals = week.data.flatMap((d) => d.mealProgress || []);
      const mealAdherence =
        allMeals.length > 0
          ? ((allMeals.filter((m) => m.status === 'fully_consumed').length +
              allMeals.filter((m) => m.status === 'partially_consumed').length *
                0.5) /
              allMeals.length) *
            100
          : 0;

      const satisfactions = week.data
        .filter((d) => d.overall_satisfaction !== null)
        .map((d) => d.overall_satisfaction);
      const averageSatisfaction =
        satisfactions.length > 0
          ? satisfactions.reduce((sum, s) => sum + s, 0) / satisfactions.length
          : null;

      return {
        weekNumber: week.weekNumber,
        startDate: week.startDate,
        endDate: week.endDate,
        averageWeight: averageWeight !== null ? Math.round(averageWeight * 10) / 10 : null,
        workoutAdherence: Math.round(workoutAdherence * 100) / 100,
        mealAdherence: Math.round(mealAdherence * 100) / 100,
        averageSatisfaction:
          averageSatisfaction !== null
            ? Math.round(averageSatisfaction * 10) / 10
            : null,
      };
    });
  }

  private calculateSummary(
    report: MemberProgressReport,
  ): MemberProgressReport['summary'] {
    const totalDaysTracked = report.dailyBreakdown.length;

    const workoutScore = report.workoutStats.adherenceRate;
    const mealScore = report.mealStats.adherenceRate;
    const wellnessScore =
      report.wellnessMetrics.averageSatisfaction !== null
        ? report.wellnessMetrics.averageSatisfaction * 10
        : 0;

    const consistencyScore =
      Math.round(((workoutScore + mealScore + wellnessScore) / 3) * 100) / 100;

    let overallProgress = 'Good';
    if (consistencyScore >= 80) {
      overallProgress = 'Excellent';
    } else if (consistencyScore >= 60) {
      overallProgress = 'Good';
    } else if (consistencyScore >= 40) {
      overallProgress = 'Fair';
    } else {
      overallProgress = 'Needs Improvement';
    }

    const strengths: string[] = [];
    if (report.workoutStats.adherenceRate >= 80) {
      strengths.push('Excellent workout consistency');
    }
    if (report.mealStats.adherenceRate >= 80) {
      strengths.push('Great meal plan adherence');
    }
    if (report.wellnessMetrics.averageWaterIntake && report.wellnessMetrics.averageWaterIntake >= 2.5) {
      strengths.push('Good hydration habits');
    }
    if (report.wellnessMetrics.averageSleepHours && report.wellnessMetrics.averageSleepHours >= 7) {
      strengths.push('Adequate sleep duration');
    }
    if (report.weightProgress.progressToTarget && report.weightProgress.progressToTarget > 0) {
      strengths.push('Positive weight progress toward goal');
    }

    const areasForImprovement: string[] = [];
    if (report.workoutStats.adherenceRate < 60) {
      areasForImprovement.push('Increase workout consistency');
    }
    if (report.mealStats.adherenceRate < 60) {
      areasForImprovement.push('Improve meal plan adherence');
    }
    if (report.wellnessMetrics.averageWaterIntake && report.wellnessMetrics.averageWaterIntake < 2) {
      areasForImprovement.push('Increase daily water intake');
    }
    if (report.wellnessMetrics.averageSleepHours && report.wellnessMetrics.averageSleepHours < 6) {
      areasForImprovement.push('Prioritize better sleep');
    }
    if (
      report.wellnessMetrics.averageStressLevel &&
      (report.wellnessMetrics.averageStressLevel === 'high' ||
        report.wellnessMetrics.averageStressLevel === 'very_high')
    ) {
      areasForImprovement.push('Focus on stress management');
    }
    if (totalDaysTracked < 5 && report.reportPeriod === 'weekly') {
      areasForImprovement.push('Track progress more consistently');
    }

    return {
      totalDaysTracked,
      consistencyScore,
      overallProgress,
      strengths: strengths.length > 0 ? strengths : ['Keep building healthy habits'],
      areasForImprovement:
        areasForImprovement.length > 0
          ? areasForImprovement
          : ['Continue current positive habits'],
    };
  }

  private getMostCommon(arr: any[]): string | null {
    if (arr.length === 0) return null;

    const counts: { [key: string]: number } = {};
    arr.forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  }
}
