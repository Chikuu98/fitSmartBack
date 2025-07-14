import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyProgress } from '../entities/daily-progress.entity';
import { WorkoutProgress } from '../entities/workout-progress.entity';
import { MealProgress } from '../entities/meal-progress.entity';
import { AcceptedPlan } from '../entities/accepted-plan.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { MealItem } from '../entities/meal-item.entity';
import { CreateDailyProgressDto, UpdateDailyProgressDto } from '../dto/daily-progress.dto';
import { CreateWorkoutProgressDto } from '../dto/workout-progress.dto';
import { CreateMealProgressDto } from '../dto/meal-progress.dto';

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
  ) {}

  /**
   * Create daily progress entry
   */
  async createDailyProgress(
    userId: number,
    acceptedPlanId: number,
    dto: CreateDailyProgressDto,
  ): Promise<DailyProgress> {
    // Validate accepted plan exists and belongs to user
    const acceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { id: acceptedPlanId },
      relations: ['user'],
    });

    if (!acceptedPlan || acceptedPlan.user.id !== userId) {
      throw new NotFoundException('Accepted plan not found');
    }

    // Check if progress already exists for this date
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
    // Validate daily progress exists and belongs to user
    const dailyProgress = await this.dailyProgressRepository.findOne({
      where: { id: dailyProgressId },
      relations: ['user', 'acceptedPlan'],
    });

    if (!dailyProgress || dailyProgress.user.id !== userId) {
      throw new NotFoundException('Daily progress entry not found');
    }

    // Validate workout exercise exists
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
    // Validate daily progress exists and belongs to user
    const dailyProgress = await this.dailyProgressRepository.findOne({
      where: { id: dailyProgressId },
      relations: ['user', 'acceptedPlan'],
    });

    if (!dailyProgress || dailyProgress.user.id !== userId) {
      throw new NotFoundException('Daily progress entry not found');
    }

    // Validate meal item exists
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
      portion_percentage: dto.portion_percentage,
      satisfaction_rating: dto.satisfaction_rating,
      taste_rating: dto.taste_rating,
      hunger_before: dto.hunger_before,
      hunger_after: dto.hunger_after,
      substitutions: dto.substitutions,
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
    // Validate accepted plan belongs to user
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
    
    // Calculate completed days based on overall satisfaction rating
    const completedDays = progressEntries.filter(p => 
      p.overall_satisfaction && p.overall_satisfaction >= 5
    ).length;
    
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    // Calculate current streak
    let streakDays = 0;
    for (const entry of progressEntries) {
      if (entry.overall_satisfaction && entry.overall_satisfaction >= 5) {
        streakDays++;
      } else {
        break;
      }
    }

    const lastActivity = progressEntries.length > 0 ? progressEntries[0].progress_date : null;

    // Calculate weight statistics
    const weightsEntries = progressEntries.filter(p => p.current_weight);
    const weights = weightsEntries.map(p => p.current_weight);
    const averageWeight = weights.length > 0 
      ? weights.reduce((sum, weight) => sum + weight, 0) / weights.length 
      : null;
    
    const weightChange = weights.length > 1 
      ? weights[0] - weights[weights.length - 1] 
      : null;

    // Calculate average satisfaction
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
}
