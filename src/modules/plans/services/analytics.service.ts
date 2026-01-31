import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanAnalytics, ImprovementTrend } from '../entities/plan-analytics.entity';
import { AcceptedPlan } from '../entities/accepted-plan.entity';
import { DailyProgress } from '../entities/daily-progress.entity';
import { WorkoutProgress } from '../entities/workout-progress.entity';
import { MealProgress } from '../entities/meal-progress.entity';
import { PlanFeedback } from '../entities/plan-feedback.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PlanAnalytics)
    private analyticsRepository: Repository<PlanAnalytics>,
    @InjectRepository(AcceptedPlan)
    private acceptedPlanRepository: Repository<AcceptedPlan>,
    @InjectRepository(DailyProgress)
    private dailyProgressRepository: Repository<DailyProgress>,
    @InjectRepository(WorkoutProgress)
    private workoutProgressRepository: Repository<WorkoutProgress>,
    @InjectRepository(MealProgress)
    private mealProgressRepository: Repository<MealProgress>,
    @InjectRepository(PlanFeedback)
    private feedbackRepository: Repository<PlanFeedback>,
  ) {}

  async generatePlanAnalytics(
    userId: number,
    acceptedPlanId: number,
  ): Promise<PlanAnalytics> {
    const acceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { id: acceptedPlanId },
      relations: ['user', 'generatedPlan', 'generatedPlan.planType'],
    });

    if (!acceptedPlan || acceptedPlan.user.id !== userId) {
      throw new NotFoundException('Accepted plan not found');
    }

    let analytics = await this.analyticsRepository.findOne({
      where: { acceptedPlan: { id: acceptedPlanId } },
    });

    const analyticsData = await this.calculateAnalytics(acceptedPlanId);

    if (analytics) {
      Object.assign(analytics, analyticsData);
    } else {
      analytics = this.analyticsRepository.create({
        acceptedPlan: { id: acceptedPlanId },
        ...analyticsData,
      });
    }

    return this.analyticsRepository.save(analytics);
  }

  private async calculateAnalytics(acceptedPlanId: number): Promise<Partial<PlanAnalytics>> {
    const progressEntries = await this.dailyProgressRepository.find({
      where: { acceptedPlan: { id: acceptedPlanId } },
      relations: ['workoutProgress', 'mealProgress'],
      order: { progress_date: 'ASC' },
    });

    const feedback = await this.feedbackRepository.findOne({
      where: { acceptedPlan: { id: acceptedPlanId } },
    });

    const totalDays = progressEntries.length;

    const allWorkoutProgress = progressEntries.flatMap(p => p.workoutProgress || []);
    const completedWorkouts = allWorkoutProgress.filter(w => w.status === 'completed').length;
    const workout_completion_rate = allWorkoutProgress.length > 0 
      ? (completedWorkouts / allWorkoutProgress.length) * 100 
      : 0;

    const allMealProgress = progressEntries.flatMap(p => p.mealProgress || []);
    const consumedMeals = allMealProgress.filter(m => 
      m.status === 'fully_consumed' || m.status === 'partially_consumed'
    ).length;
    const meal_completion_rate = allMealProgress.length > 0 
      ? (consumedMeals / allMealProgress.length) * 100 
      : 0;

    const completion_rate = (workout_completion_rate + meal_completion_rate) / 2;

    const weightsEntries = progressEntries.filter(p => p.current_weight);
    const weight_change_kg = weightsEntries.length > 1 
      ? weightsEntries[weightsEntries.length - 1].current_weight - weightsEntries[0].current_weight
      : undefined;

    const activeDays = progressEntries.filter(p => 
      p.overall_satisfaction && p.overall_satisfaction >= 5
    ).length;
    const consistency_score = totalDays > 0 ? (activeDays / totalDays) * 100 : 0;

    const engagedEntries = progressEntries.filter(p => 
      p.workoutProgress?.length > 0 || p.mealProgress?.length > 0
    ).length;
    const engagement_score = totalDays > 0 ? (engagedEntries / totalDays) * 100 : 0;

    const first_week = progressEntries.slice(0, 7);
    const last_week = progressEntries.slice(-7);
    
    const firstWeekSatisfaction = first_week
      .filter(p => p.overall_satisfaction)
      .map(p => p.overall_satisfaction);
    const lastWeekSatisfaction = last_week
      .filter(p => p.overall_satisfaction)
      .map(p => p.overall_satisfaction);

    let improvement_trend: ImprovementTrend | undefined = undefined;
    if (firstWeekSatisfaction.length > 0 && lastWeekSatisfaction.length > 0) {
      const firstAvg = firstWeekSatisfaction.reduce((sum, val) => sum + val, 0) / firstWeekSatisfaction.length;
      const lastAvg = lastWeekSatisfaction.reduce((sum, val) => sum + val, 0) / lastWeekSatisfaction.length;
      const improvement = ((lastAvg - firstAvg) / firstAvg) * 100;

      if (improvement < -10) improvement_trend = ImprovementTrend.DECLINING;
      else if (improvement < 10) improvement_trend = ImprovementTrend.STABLE;
      else if (improvement < 25) improvement_trend = ImprovementTrend.IMPROVING;
      else improvement_trend = ImprovementTrend.EXCELLENT;
    }

    return {
      completion_rate: Math.round(completion_rate * 100) / 100,
      workout_completion_rate: Math.round(workout_completion_rate * 100) / 100,
      meal_completion_rate: Math.round(meal_completion_rate * 100) / 100,
      weight_change_kg: weight_change_kg ? Math.round(weight_change_kg * 100) / 100 : undefined,
      consistency_score: Math.round(consistency_score * 100) / 100,
      engagement_score: Math.round(engagement_score * 100) / 100,
      improvement_trend,
    };
  }

  async getPlanAnalytics(
    userId: number,
    acceptedPlanId: number,
  ): Promise<PlanAnalytics | null> {
    const acceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { id: acceptedPlanId },
      relations: ['user'],
    });

    if (!acceptedPlan || acceptedPlan.user.id !== userId) {
      throw new NotFoundException('Accepted plan not found');
    }

    return this.analyticsRepository.findOne({
      where: { acceptedPlan: { id: acceptedPlanId } },
      relations: ['acceptedPlan'],
    });
  }

  async getUserAnalytics(userId: number): Promise<PlanAnalytics[]> {
    const userAcceptedPlans = await this.acceptedPlanRepository.find({
      where: { user: { id: userId } },
      relations: ['analytics'],
    });

    const analytics: PlanAnalytics[] = [];
    for (const plan of userAcceptedPlans) {
      if (plan.analytics) {
        analytics.push(plan.analytics);
      }
    }

    return analytics.sort((a, b) => b.calculated_at.getTime() - a.calculated_at.getTime());
  }

  async getUserAnalyticsSummary(userId: number): Promise<{
    totalPlans: number;
    averageCompletion: number;
    averageWorkoutCompletion: number;
    averageMealCompletion: number;
    totalWeightChange: number;
    averageConsistency: number;
    averageEngagement: number;
  }> {
    const analytics = await this.getUserAnalytics(userId);
    
    if (analytics.length === 0) {
      return {
        totalPlans: 0,
        averageCompletion: 0,
        averageWorkoutCompletion: 0,
        averageMealCompletion: 0,
        totalWeightChange: 0,
        averageConsistency: 0,
        averageEngagement: 0,
      };
    }

    const totalPlans = analytics.length;
    const averageCompletion = analytics.reduce((sum, a) => sum + a.completion_rate, 0) / totalPlans;
    const averageWorkoutCompletion = analytics.reduce((sum, a) => sum + a.workout_completion_rate, 0) / totalPlans;
    const averageMealCompletion = analytics.reduce((sum, a) => sum + a.meal_completion_rate, 0) / totalPlans;
    
    const weightChanges = analytics.filter(a => a.weight_change_kg !== null && a.weight_change_kg !== undefined);
    const totalWeightChange = weightChanges.reduce((sum, a) => sum + a.weight_change_kg, 0);
    
    const consistencyEntries = analytics.filter(a => a.consistency_score !== null && a.consistency_score !== undefined);
    const averageConsistency = consistencyEntries.length > 0
      ? consistencyEntries.reduce((sum, a) => sum + a.consistency_score, 0) / consistencyEntries.length
      : 0;

    const engagementEntries = analytics.filter(a => a.engagement_score !== null && a.engagement_score !== undefined);
    const averageEngagement = engagementEntries.length > 0
      ? engagementEntries.reduce((sum, a) => sum + a.engagement_score, 0) / engagementEntries.length
      : 0;

    return {
      totalPlans,
      averageCompletion: Math.round(averageCompletion * 100) / 100,
      averageWorkoutCompletion: Math.round(averageWorkoutCompletion * 100) / 100,
      averageMealCompletion: Math.round(averageMealCompletion * 100) / 100,
      totalWeightChange: Math.round(totalWeightChange * 100) / 100,
      averageConsistency: Math.round(averageConsistency * 100) / 100,
      averageEngagement: Math.round(averageEngagement * 100) / 100,
    };
  }

  async deleteAnalytics(userId: number, acceptedPlanId: number): Promise<void> {
    const acceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { id: acceptedPlanId },
      relations: ['user'],
    });

    if (!acceptedPlan || acceptedPlan.user.id !== userId) {
      throw new NotFoundException('Accepted plan not found');
    }

    const analytics = await this.analyticsRepository.findOne({
      where: { acceptedPlan: { id: acceptedPlanId } },
    });

    if (analytics) {
      await this.analyticsRepository.remove(analytics);
    }
  }
}
