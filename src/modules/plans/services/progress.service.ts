import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyProgress } from '../entities/daily-progress.entity';
import { WorkoutProgress } from '../entities/workout-progress.entity';
import { MealProgress } from '../entities/meal-progress.entity';
import { AcceptedPlan, AcceptedPlanStatus } from '../entities/accepted-plan.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { MealItem } from '../entities/meal-item.entity';
import { WorkoutPlan } from '../entities/workout-plan.entity';
import { MealPlan } from '../entities/meal-plan.entity';
import { PlanPausePeriod } from '../entities/plan-pause-period.entity';
import { CreateDailyProgressDto, UpdateDailyProgressDto } from '../dto/daily-progress.dto';
import { CreateWorkoutProgressDto } from '../dto/workout-progress.dto';
import { CreateMealProgressDto } from '../dto/meal-progress.dto';
import { BatchProgressDto } from '../dto/batch-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(DailyProgress)
    private dailyProgressRepository: Repository<DailyProgress>,
    @InjectRepository(WorkoutProgress)
    private workoutProgressRepository: Repository<WorkoutProgress>,
    @InjectRepository(MealProgress)
    private mealProgressRepository: Repository<MealProgress>,
    @InjectRepository(AcceptedPlan)
    private acceptedPlanRepository: Repository<AcceptedPlan>,
    @InjectRepository(WorkoutExercise)
    private workoutExerciseRepository: Repository<WorkoutExercise>,
    @InjectRepository(MealItem)
    private mealItemRepository: Repository<MealItem>,
    @InjectRepository(WorkoutPlan)
    private workoutPlanRepository: Repository<WorkoutPlan>,
    @InjectRepository(MealPlan)
    private mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(PlanPausePeriod)
    private pausePeriodRepository: Repository<PlanPausePeriod>,
  ) {}

  /**
   * Create daily progress entry
   */
  async createDailyProgress(
    userId: number,
    acceptedPlanId: number,
    dto: CreateDailyProgressDto,
  ): Promise<DailyProgress> {
    const acceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { id: acceptedPlanId },
      relations: ['user'],
    });

    if (!acceptedPlan || acceptedPlan.user.id !== userId) {
      throw new NotFoundException('Accepted plan not found');
    }

    const existingProgress = await this.dailyProgressRepository.findOne({
      where: {
        acceptedPlan: { id: acceptedPlanId },
        progress_date: new Date(dto.progress_date),
      },
    });

    if (existingProgress) {
      throw new BadRequestException('Progress already recorded for this date');
    }

    const progress = this.dailyProgressRepository.create({
      user: { id: userId },
      acceptedPlan: { id: acceptedPlanId },
      progress_date: new Date(dto.progress_date),
      day_number: dto.day_number,
      current_weight: dto.current_weight,
      energy_level: dto.energy_level,
      mood: dto.mood,
      sleep_hours: dto.sleep_hours,
      sleep_quality: dto.sleep_quality,
      water_intake_liters: dto.water_intake_liters,
      stress_level: dto.stress_level,
      overall_satisfaction: dto.overall_satisfaction,
    });

    return this.dailyProgressRepository.save(progress);
  }

  /**
   * Create workout progress entry
   */
  async createWorkoutProgress(
    userId: number,
    dailyProgressId: number,
    dto: CreateWorkoutProgressDto,
  ): Promise<WorkoutProgress> {
    const dailyProgress = await this.dailyProgressRepository.findOne({
      where: { id: dailyProgressId },
      relations: ['user', 'acceptedPlan'],
    });

    if (!dailyProgress || dailyProgress.user.id !== userId) {
      throw new NotFoundException('Daily progress entry not found');
    }

    const workoutExercise = await this.workoutExerciseRepository.findOne({
      where: { id: dto.workout_exercise_id },
    });

    if (!workoutExercise) {
      throw new NotFoundException('Workout exercise not found');
    }

    const workoutProgress = this.workoutProgressRepository.create({
      dailyProgress: { id: dailyProgressId },
      workoutExercise: { id: dto.workout_exercise_id },
      status: dto.status,
      actual_weight: dto.actual_weight,
      notes: dto.notes,
    });

    return this.workoutProgressRepository.save(workoutProgress);
  }

  /**
   * Create meal progress entry
   */
  async createMealProgress(
    userId: number,
    dailyProgressId: number,
    dto: CreateMealProgressDto,
  ): Promise<MealProgress> {
    const dailyProgress = await this.dailyProgressRepository.findOne({
      where: { id: dailyProgressId },
      relations: ['user', 'acceptedPlan'],
    });

    if (!dailyProgress || dailyProgress.user.id !== userId) {
      throw new NotFoundException('Daily progress entry not found');
    }

    const mealItem = await this.mealItemRepository.findOne({
      where: { id: dto.meal_item_id },
    });

    if (!mealItem) {
      throw new NotFoundException('Meal item not found');
    }

    const mealProgress = this.mealProgressRepository.create({
      dailyProgress: { id: dailyProgressId },
      mealItem: { id: dto.meal_item_id },
      status: dto.status,
      notes: dto.notes,
    });

    return this.mealProgressRepository.save(mealProgress);
  }

  /**
   * Get daily progress for a user's accepted plan
   */
  async getDailyProgress(
    userId: number,
    acceptedPlanId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<DailyProgress[]> {
    const query = this.dailyProgressRepository
      .createQueryBuilder('dp')
      .leftJoinAndSelect('dp.acceptedPlan', 'ap')
      .leftJoinAndSelect('dp.user', 'user')
      .leftJoinAndSelect('dp.workoutProgress', 'wp')
      .leftJoinAndSelect('wp.workoutExercise', 'we')
      .leftJoinAndSelect('dp.mealProgress', 'mp')
      .leftJoinAndSelect('mp.mealItem', 'mi')
      .where('ap.id = :acceptedPlanId', { acceptedPlanId })
      .andWhere('user.id = :userId', { userId })
      .orderBy('dp.progress_date', 'DESC');

    if (startDate) {
      query.andWhere('dp.progress_date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('dp.progress_date <= :endDate', { endDate });
    }

    return query.getMany();
  }

  /**
   * Get progress summary for a user's accepted plan
   */
  async getProgressSummary(
    userId: number,
    acceptedPlanId: number,
  ): Promise<{
    totalDays: number;
    completedDays: number;
    completionRate: number;
    streakDays: number;
    lastActivity: Date | null;
    averageWeight: number | null;
    weightChange: number | null;
    averageSatisfaction: number | null;
  }> {
    const acceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { id: acceptedPlanId },
      relations: ['user'],
    });

    if (!acceptedPlan || acceptedPlan.user.id !== userId) {
      throw new NotFoundException('Accepted plan not found');
    }

    const progressEntries = await this.dailyProgressRepository.find({
      where: { acceptedPlan: { id: acceptedPlanId } },
      order: { progress_date: 'DESC' },
    });

    const totalDays = progressEntries.length;
    
    const completedDays = progressEntries.filter(p => 
      p.overall_satisfaction && p.overall_satisfaction >= 5
    ).length;
    
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    let streakDays = 0;
    for (const entry of progressEntries) {
      if (entry.overall_satisfaction && entry.overall_satisfaction >= 5) {
        streakDays++;
      } else {
        break;
      }
    }

    const lastActivity = progressEntries.length > 0 ? progressEntries[0].progress_date : null;

    const weightsEntries = progressEntries.filter(p => p.current_weight);
    const weights = weightsEntries.map(p => p.current_weight);
    const averageWeight = weights.length > 0 
      ? weights.reduce((sum, weight) => sum + weight, 0) / weights.length 
      : null;
    
    const weightChange = weights.length > 1 
      ? weights[0] - weights[weights.length - 1] 
      : null;

    const satisfactionEntries = progressEntries.filter(p => p.overall_satisfaction);
    const averageSatisfaction = satisfactionEntries.length > 0
      ? satisfactionEntries.reduce((sum, entry) => sum + entry.overall_satisfaction, 0) / satisfactionEntries.length
      : null;

    return {
      totalDays,
      completedDays,
      completionRate: Math.round(completionRate * 100) / 100,
      streakDays,
      lastActivity,
      averageWeight: averageWeight ? Math.round(averageWeight * 100) / 100 : null,
      weightChange: weightChange ? Math.round(weightChange * 100) / 100 : null,
      averageSatisfaction: averageSatisfaction ? Math.round(averageSatisfaction * 100) / 100 : null,
    };
  }

  /**
   * Update daily progress
   */
  async updateDailyProgress(
    userId: number,
    progressId: number,
    updates: UpdateDailyProgressDto,
  ): Promise<DailyProgress> {
    const progress = await this.dailyProgressRepository.findOne({
      where: { id: progressId },
      relations: ['user', 'acceptedPlan'],
    });

    if (!progress || progress.user.id !== userId) {
      throw new NotFoundException('Daily progress entry not found');
    }

    Object.assign(progress, updates);
    return this.dailyProgressRepository.save(progress);
  }

  /**
   * Delete daily progress and all associated workout/meal progress
   */
  async deleteDailyProgress(userId: number, progressId: number): Promise<void> {
    const progress = await this.dailyProgressRepository.findOne({
      where: { id: progressId },
      relations: ['user', 'acceptedPlan'],
    });

    if (!progress || progress.user.id !== userId) {
      throw new NotFoundException('Daily progress entry not found');
    }

    await this.dailyProgressRepository.remove(progress);
  }

  /**
   * Get workout progress for a daily progress entry
   */
  async getWorkoutProgress(userId: number, dailyProgressId: number): Promise<WorkoutProgress[]> {
    const dailyProgress = await this.dailyProgressRepository.findOne({
      where: { id: dailyProgressId },
      relations: ['user'],
    });

    if (!dailyProgress || dailyProgress.user.id !== userId) {
      throw new NotFoundException('Daily progress entry not found');
    }

    return this.workoutProgressRepository.find({
      where: { dailyProgress: { id: dailyProgressId } },
      relations: ['workoutExercise'],
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Get meal progress for a daily progress entry
   */
  async getMealProgress(userId: number, dailyProgressId: number): Promise<MealProgress[]> {
    const dailyProgress = await this.dailyProgressRepository.findOne({
      where: { id: dailyProgressId },
      relations: ['user'],
    });

    if (!dailyProgress || dailyProgress.user.id !== userId) {
      throw new NotFoundException('Daily progress entry not found');
    }

    return this.mealProgressRepository.find({
      where: { dailyProgress: { id: dailyProgressId } },
      relations: ['mealItem'],
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Get today's plan details for an accepted plan
   */
  async getTodaysPlanDetails(userId: number, acceptedPlanId: number): Promise<any> {
    let acceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { id: acceptedPlanId },
      relations: ['user'],
    });

    if (!acceptedPlan || acceptedPlan.user.id !== userId) {
      throw new NotFoundException('Accepted plan not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(acceptedPlan.end_date);
    endDate.setHours(0, 0, 0, 0);
    
    if (acceptedPlan.status === AcceptedPlanStatus.ACTIVE && today > endDate) {
      acceptedPlan.status = AcceptedPlanStatus.COMPLETED;
      acceptedPlan.completed_at = today;
      acceptedPlan = await this.acceptedPlanRepository.save(acceptedPlan);
    }

    try {
      await this.validateProgressTracking(acceptedPlan, today);
    } catch (error) {
      return {
        acceptedPlan: {
          id: acceptedPlan.id,
          plan_name: acceptedPlan.plan_name,
          status: acceptedPlan.status,
        },
        canTrackProgress: false,
        errorMessage: error.message,
        currentDayNumber: null,
        progressDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
        workout: null,
        meal: null,
        dailyProgress: null,
      };
    }

    const startDate = new Date(acceptedPlan.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const adjustedDays = daysSinceStart - (acceptedPlan.total_paused_days || 0);
    
    const workoutPlansCount = await this.workoutPlanRepository.count({
      where: { acceptedPlan: { id: acceptedPlanId } },
    });

    const dayNumber = adjustedDays >= 0 ? (adjustedDays % workoutPlansCount) + 1 : null;

    if (dayNumber === null || adjustedDays < 0) {
      return {
        acceptedPlan: {
          id: acceptedPlan.id,
          plan_name: acceptedPlan.plan_name,
          status: acceptedPlan.status,
        },
        canTrackProgress: false,
        errorMessage: 'Plan has not started yet',
        currentDayNumber: null,
        progressDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
        workout: null,
        meal: null,
        dailyProgress: null,
      };
    }

    const workoutPlan = await this.workoutPlanRepository.findOne({
      where: { 
        acceptedPlan: { id: acceptedPlanId },
        day_number: dayNumber,
      },
      relations: ['exercises'],
    });

    const mealPlan = await this.mealPlanRepository.findOne({
      where: { 
        acceptedPlan: { id: acceptedPlanId },
        day_number: dayNumber,
      },
      relations: ['meals'],
    });

    const dailyProgress = await this.dailyProgressRepository.findOne({
      where: {
        acceptedPlan: { id: acceptedPlanId },
        progress_date: today,
      },
      relations: ['workoutProgress', 'workoutProgress.workoutExercise', 'mealProgress', 'mealProgress.mealItem'],
    });

    return {
      acceptedPlan: {
        id: acceptedPlan.id,
        plan_name: acceptedPlan.plan_name,
        status: acceptedPlan.status,
        start_date: acceptedPlan.start_date,
        end_date: acceptedPlan.end_date,
      },
      canTrackProgress: true,
      currentDayNumber: dayNumber,
      progressDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      workout: workoutPlan,
      meal: mealPlan,
      dailyProgress,
    };
  }

  /**
   * Batch create or update progress for workout and meal items
   */
  async saveBatchProgress(
    userId: number,
    acceptedPlanId: number,
    progressDate: Date,
    dayNumber: number,
    batchDto: BatchProgressDto,
  ): Promise<DailyProgress> {
    let acceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { id: acceptedPlanId },
      relations: ['user'],
    });

    if (!acceptedPlan || acceptedPlan.user.id !== userId) {
      throw new NotFoundException('Accepted plan not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(acceptedPlan.end_date);
    endDate.setHours(0, 0, 0, 0);
    
    if (acceptedPlan.status === AcceptedPlanStatus.ACTIVE && today > endDate) {
      acceptedPlan.status = AcceptedPlanStatus.COMPLETED;
      acceptedPlan.completed_at = today;
      acceptedPlan = await this.acceptedPlanRepository.save(acceptedPlan);
    }

    await this.validateProgressTracking(acceptedPlan, progressDate);

    let dailyProgress = await this.dailyProgressRepository.findOne({
      where: {
        acceptedPlan: { id: acceptedPlanId },
        progress_date: progressDate,
      },
      relations: ['workoutProgress', 'mealProgress'],
    });

    if (!dailyProgress) {
      dailyProgress = this.dailyProgressRepository.create({
        user: { id: userId },
        acceptedPlan: { id: acceptedPlanId },
        progress_date: progressDate,
        day_number: dayNumber,
      });
      dailyProgress = await this.dailyProgressRepository.save(dailyProgress);
    }
    
    if (batchDto.dailyMetrics) {
      Object.assign(dailyProgress, {
        current_weight: batchDto.dailyMetrics.current_weight,
        energy_level: batchDto.dailyMetrics.energy_level,
        mood: batchDto.dailyMetrics.mood,
        sleep_hours: batchDto.dailyMetrics.sleep_hours,
        sleep_quality: batchDto.dailyMetrics.sleep_quality,
        water_intake_liters: batchDto.dailyMetrics.water_intake_liters,
        stress_level: batchDto.dailyMetrics.stress_level,
        overall_satisfaction: batchDto.dailyMetrics.overall_satisfaction,
      });
      dailyProgress = await this.dailyProgressRepository.save(dailyProgress);
    }

    if (batchDto.workouts && batchDto.workouts.length > 0) {
      for (const workoutItem of batchDto.workouts) {
        let workoutProgress = await this.workoutProgressRepository.findOne({
          where: {
            dailyProgress: { id: dailyProgress.id },
            workoutExercise: { id: workoutItem.workout_exercise_id },
          },
        });

        if (workoutProgress) {
          workoutProgress.status = workoutItem.status;
          if (workoutItem.actual_weight !== undefined) {
            workoutProgress.actual_weight = workoutItem.actual_weight;
          }
          if (workoutItem.notes !== undefined) {
            workoutProgress.notes = workoutItem.notes;
          }
          await this.workoutProgressRepository.save(workoutProgress);
        } else {
          workoutProgress = this.workoutProgressRepository.create({
            dailyProgress: { id: dailyProgress.id },
            workoutExercise: { id: workoutItem.workout_exercise_id },
            status: workoutItem.status,
            actual_weight: workoutItem.actual_weight,
            notes: workoutItem.notes,
          });
          await this.workoutProgressRepository.save(workoutProgress);
        }
      }
    }

    if (batchDto.meals && batchDto.meals.length > 0) {
      for (const mealItem of batchDto.meals) {
        let mealProgress = await this.mealProgressRepository.findOne({
          where: {
            dailyProgress: { id: dailyProgress.id },
            mealItem: { id: mealItem.meal_item_id },
          },
        });

        if (mealProgress) {
          mealProgress.status = mealItem.status;
          if (mealItem.notes !== undefined) {
            mealProgress.notes = mealItem.notes;
          }
          await this.mealProgressRepository.save(mealProgress);
        } else {
          mealProgress = this.mealProgressRepository.create({
            dailyProgress: { id: dailyProgress.id },
            mealItem: { id: mealItem.meal_item_id },
            status: mealItem.status,
            notes: mealItem.notes,
          });
          await this.mealProgressRepository.save(mealProgress);
        }
      }
    }

    const reloadedProgress = await this.dailyProgressRepository.findOne({
      where: { id: dailyProgress.id },
      relations: ['workoutProgress', 'workoutProgress.workoutExercise', 'mealProgress', 'mealProgress.mealItem'],
    });

    if (!reloadedProgress) {
      throw new NotFoundException('Failed to reload daily progress');
    }

    return reloadedProgress;
  }


  private async isDateInPausePeriod(acceptedPlanId: number, checkDate: Date): Promise<boolean> {
    const pausePeriods = await this.pausePeriodRepository.find({
      where: { acceptedPlan: { id: acceptedPlanId } },
    });

    const checkDateOnly = new Date(checkDate);
    checkDateOnly.setHours(0, 0, 0, 0);

    for (const period of pausePeriods) {
      const startDate = new Date(period.pause_start_date);
      startDate.setHours(0, 0, 0, 0);
      
      if (!period.pause_end_date) {
        if (checkDateOnly >= startDate) {
          return true;
        }
      } else {
        const endDate = new Date(period.pause_end_date);
        endDate.setHours(0, 0, 0, 0);
        
        if (checkDateOnly >= startDate && checkDateOnly <= endDate) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Helper: Validate plan status and date range for progress tracking
   */
  private async validateProgressTracking(
    acceptedPlan: AcceptedPlan,
    progressDate: Date,
  ): Promise<void> {
    if (acceptedPlan.status === AcceptedPlanStatus.PAUSED) {
      throw new BadRequestException(
        'Cannot track progress while the plan is paused. Please resume the plan first.'
      );
    }

    if (acceptedPlan.status === AcceptedPlanStatus.CANCELLED) {
      throw new BadRequestException('Cannot track progress for a cancelled plan.');
    }

    if (acceptedPlan.status === AcceptedPlanStatus.COMPLETED) {
      throw new BadRequestException('Cannot track progress for a completed plan.');
    }

    if (acceptedPlan.status === AcceptedPlanStatus.ACCEPTED) {
      throw new BadRequestException(
        'Plan is not active yet. Please activate the plan before tracking progress.'
      );
    }

    const startDate = new Date(acceptedPlan.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(acceptedPlan.end_date);
    endDate.setHours(0, 0, 0, 0);
    const progressDateOnly = new Date(progressDate);
    progressDateOnly.setHours(0, 0, 0, 0);

    if (progressDateOnly < startDate) {
      throw new BadRequestException(
        `Cannot track progress before plan start date (${startDate.toLocaleDateString()}).`
      );
    }

    if (progressDateOnly > endDate) {
      throw new BadRequestException(
        `Cannot track progress after plan end date (${endDate.toLocaleDateString()}).`
      );
    }

    const isInPausePeriod = await this.isDateInPausePeriod(acceptedPlan.id, progressDate);
    if (isInPausePeriod) {
      throw new BadRequestException(
        `Cannot track progress for ${progressDateOnly.toLocaleDateString()} as the plan was paused during this period.`
      );
    }
  }
}
