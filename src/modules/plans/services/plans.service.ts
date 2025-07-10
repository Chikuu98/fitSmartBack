import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/core/users/user.entity';
import { MemberDetail } from '@/core/users/members/member_detail.entity';
import { PlanType } from '../entities/plan-type.entity';
import { GeneratedPlan, GenerationStatus } from '../entities/generated-plan.entity';
import { AcceptedPlan, AcceptedPlanStatus } from '../entities/accepted-plan.entity';
import { WorkoutPlan } from '../entities/workout-plan.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { MealPlan } from '../entities/meal-plan.entity';
import { MealItem } from '../entities/meal-item.entity';
import { UserPreferences } from '../entities/user-preferences.entity';
import { OpenAIService } from './openai.service';
import { GeneratePlanDto, PlanGenerationPromptDto } from '../dto/generate-plan.dto';
import { AcceptPlanDto, PlanResponseDto } from '../dto/accept-plan.dto';
import { UserPreferencesService } from './user-preferences.service';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MemberDetail)
    private memberDetailRepository: Repository<MemberDetail>,
    @InjectRepository(PlanType)
    private planTypeRepository: Repository<PlanType>,
    @InjectRepository(GeneratedPlan)
    private generatedPlanRepository: Repository<GeneratedPlan>,
    @InjectRepository(AcceptedPlan)
    private acceptedPlanRepository: Repository<AcceptedPlan>,
    @InjectRepository(WorkoutPlan)
    private workoutPlanRepository: Repository<WorkoutPlan>,
    @InjectRepository(WorkoutExercise)
    private workoutExerciseRepository: Repository<WorkoutExercise>,
    @InjectRepository(MealPlan)
    private mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(MealItem)
    private mealItemRepository: Repository<MealItem>,
    private openAIService: OpenAIService,
    private userPreferencesService: UserPreferencesService,
  ) {}

  async generatePlan(userId: number, generatePlanDto: GeneratePlanDto): Promise<PlanResponseDto> {
    try {
      // Get user and member details
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['memberDetail']
      });

      if (!user || !user.memberDetail) {
        throw new NotFoundException('User or member details not found');
      }

      // Get plan type (assuming combined plan)
      const planType = await this.planTypeRepository.findOne({
        where: { name: 'combined' }
      });

      if (!planType) {
        throw new NotFoundException('Plan type not found');
      }

      // Build prompt data
      const promptData = await this.buildPromptData(user, generatePlanDto);

      // Create generated plan record
      const generatedPlan = this.generatedPlanRepository.create({
        user,
        planType,
        duration_days: generatePlanDto.duration_days || 28,
        prompt_data: promptData,
        status: GenerationStatus.GENERATING,
      });

      await this.generatedPlanRepository.save(generatedPlan);

      try {
        // Generate plan with OpenAI
        const { response, model } = await this.openAIService.generatePlan(promptData);

        // Update plan with response
        generatedPlan.ai_response = response;
        generatedPlan.generation_model = model;
        generatedPlan.status = GenerationStatus.COMPLETED;

        await this.generatedPlanRepository.save(generatedPlan);

        return {
          id: generatedPlan.id,
          plan_type_id: planType.id,
          duration_days: generatedPlan.duration_days,
          status: generatedPlan.status,
          ai_response: generatedPlan.ai_response,
          created_at: generatedPlan.created_at,
          is_accepted: false,
        };
      } catch (error) {
        // Update plan with error
        generatedPlan.status = GenerationStatus.FAILED;
        generatedPlan.error_message = error.message;
        await this.generatedPlanRepository.save(generatedPlan);
        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to generate plan for user ${userId}:`, error);
      throw error;
    }
  }

  async acceptPlan(userId: number, planId: number, acceptPlanDto: AcceptPlanDto): Promise<any> {
    const generatedPlan = await this.generatedPlanRepository.findOne({
      where: { id: planId, user: { id: userId } },
      relations: ['user', 'planType']
    });

    if (!generatedPlan) {
      throw new NotFoundException('Generated plan not found');
    }

    if (generatedPlan.status !== GenerationStatus.COMPLETED) {
      throw new BadRequestException('Plan is not ready to be accepted');
    }

    // Check if plan is already accepted
    const existingAcceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { generatedPlan: { id: planId } }
    });

    if (existingAcceptedPlan) {
      throw new BadRequestException('Plan is already accepted');
    }

    // Get user's previous plan for progression tracking
    const previousPlan = await this.acceptedPlanRepository.findOne({
      where: { user: { id: userId }, status: AcceptedPlanStatus.COMPLETED },
      order: { completed_at: 'DESC' }
    });

    // Calculate end date
    const startDate = new Date(acceptPlanDto.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + generatedPlan.duration_days - 1);

    // Create accepted plan
    const acceptedPlan = this.acceptedPlanRepository.create({
      user: generatedPlan.user,
      generatedPlan,
      previousPlan: previousPlan || undefined,
      plan_name: acceptPlanDto.plan_name,
      start_date: startDate,
      end_date: endDate,
      target_goal: acceptPlanDto.target_goal,
      initial_weight: acceptPlanDto.initial_weight,
      target_weight: acceptPlanDto.target_weight,
      status: AcceptedPlanStatus.ACTIVE,
    });

    const savedAcceptedPlan = await this.acceptedPlanRepository.save(acceptedPlan);

    // Parse and store workout and meal plans
    await this.parseAndStorePlans(savedAcceptedPlan, generatedPlan.ai_response);

    return {
      id: savedAcceptedPlan.id,
      plan_name: savedAcceptedPlan.plan_name,
      start_date: savedAcceptedPlan.start_date,
      end_date: savedAcceptedPlan.end_date,
      target_goal: savedAcceptedPlan.target_goal,
      status: savedAcceptedPlan.status,
      generated_plan: {
        id: generatedPlan.id,
        ai_response: generatedPlan.ai_response,
      },
    };
  }

  async getUserPlans(userId: number, status?: AcceptedPlanStatus): Promise<any[]> {
    const queryBuilder = this.acceptedPlanRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.generatedPlan', 'generatedPlan')
      .where('plan.user.id = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('plan.status = :status', { status });
    }

    queryBuilder.orderBy('plan.created_at', 'DESC');

    const plans = await queryBuilder.getMany();

    return plans.map(plan => ({
      id: plan.id,
      plan_name: plan.plan_name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      target_goal: plan.target_goal,
      status: plan.status,
      completion_percentage: plan.completion_percentage,
      duration_days: plan.generatedPlan?.duration_days,
      accepted_at: plan.accepted_at,
      completed_at: plan.completed_at,
    }));
  }

  async getPlanDetails(userId: number, planId: number): Promise<any> {
    const plan = await this.acceptedPlanRepository.findOne({
      where: { id: planId, user: { id: userId } },
      relations: ['generatedPlan', 'workoutPlans', 'mealPlans']
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Get workout plans with exercises
    const workoutPlans = await this.workoutPlanRepository.find({
      where: { acceptedPlan: { id: planId } },
      relations: ['exercises'],
      order: { day_number: 'ASC' }
    });

    // Get meal plans with meals
    const mealPlans = await this.mealPlanRepository.find({
      where: { acceptedPlan: { id: planId } },
      relations: ['meals'],
      order: { day_number: 'ASC' }
    });

    return {
      id: plan.id,
      plan_name: plan.plan_name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      target_goal: plan.target_goal,
      status: plan.status,
      completion_percentage: plan.completion_percentage,
      workout_plans: workoutPlans,
      meal_plans: mealPlans,
      generated_plan: plan.generatedPlan,
    };
  }

  /**
   * Get generated plans for a user
   */
  async getGeneratedPlans(userId: number, limit: number = 10, offset: number = 0): Promise<any> {
    const [plans, total] = await this.generatedPlanRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['planType', 'user'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      plans: plans.map(plan => ({
        id: plan.id,
        planType: plan.planType,
        duration_days: plan.duration_days,
        status: plan.status,
        created_at: plan.created_at,
        accepted: !!plan.acceptedPlan,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get accepted plans for a user
   */
  async getAcceptedPlans(userId: number, status?: string): Promise<any[]> {
    const queryBuilder = this.acceptedPlanRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.generatedPlan', 'generatedPlan')
      .leftJoinAndSelect('generatedPlan.planType', 'planType')
      .where('plan.user.id = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('plan.status = :status', { status });
    }

    queryBuilder.orderBy('plan.created_at', 'DESC');

    const plans = await queryBuilder.getMany();

    return plans.map(plan => ({
      id: plan.id,
      generatedPlan: {
        id: plan.generatedPlan.id,
        planType: plan.generatedPlan.planType,
      },
      plan_name: plan.plan_name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      status: plan.status,
      progress_percentage: plan.completion_percentage || 0,
      created_at: plan.created_at,
    }));
  }

  /**
   * Get a specific generated plan
   */
  async getGeneratedPlan(userId: number, planId: number): Promise<any> {
    const plan = await this.generatedPlanRepository.findOne({
      where: { id: planId, user: { id: userId } },
      relations: ['planType', 'user'],
    });

    if (!plan) {
      throw new NotFoundException('Generated plan not found');
    }

    return {
      id: plan.id,
      planType: plan.planType,
      duration_days: plan.duration_days,
      status: plan.status,
      ai_response: plan.ai_response,
      generation_model: plan.generation_model,
      prompt_data: plan.prompt_data,
      created_at: plan.created_at,
      accepted: !!plan.acceptedPlan,
    };
  }

  /**
   * Get a specific accepted plan
   */
  async getAcceptedPlan(userId: number, planId: number): Promise<any> {
    const plan = await this.acceptedPlanRepository.findOne({
      where: { id: planId, user: { id: userId } },
      relations: ['generatedPlan', 'generatedPlan.planType', 'workoutPlans', 'mealPlans'],
    });

    if (!plan) {
      throw new NotFoundException('Accepted plan not found');
    }

    // Get workout plans with exercises
    const workoutPlans = await this.workoutPlanRepository.find({
      where: { acceptedPlan: { id: planId } },
      relations: ['exercises'],
      order: { day_number: 'ASC' },
    });

    // Get meal plans with meals
    const mealPlans = await this.mealPlanRepository.find({
      where: { acceptedPlan: { id: planId } },
      relations: ['meals'],
      order: { day_number: 'ASC' },
    });

    return {
      id: plan.id,
      generatedPlan: {
        id: plan.generatedPlan.id,
        planType: plan.generatedPlan.planType,
        ai_response: plan.generatedPlan.ai_response,
      },
      plan_name: plan.plan_name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      status: plan.status,
      target_goal: plan.target_goal,
      initial_weight: plan.initial_weight,
      target_weight: plan.target_weight,
      workoutPlan: workoutPlans,
      mealPlan: mealPlans,
      progress_summary: {
        totalDays: plan.generatedPlan.duration_days,
        completionRate: plan.completion_percentage || 0,
      },
    };
  }

  /**
   * Delete a generated plan
   */
  async deleteGeneratedPlan(userId: number, planId: number): Promise<void> {
    const plan = await this.generatedPlanRepository.findOne({
      where: { id: planId, user: { id: userId } },
      relations: ['acceptedPlan'],
    });

    if (!plan) {
      throw new NotFoundException('Generated plan not found');
    }

    if (plan.acceptedPlan) {
      throw new BadRequestException('Cannot delete an accepted plan');
    }

    await this.generatedPlanRepository.remove(plan);
  }

  /**
   * Cancel an accepted plan
   */
  async cancelAcceptedPlan(userId: number, planId: number): Promise<void> {
    const plan = await this.acceptedPlanRepository.findOne({
      where: { id: planId, user: { id: userId } },
    });

    if (!plan) {
      throw new NotFoundException('Accepted plan not found');
    }

    plan.status = AcceptedPlanStatus.CANCELLED;
    // Note: Add cancelled_at field to entity if needed

    await this.acceptedPlanRepository.save(plan);
  }

  /**
   * Get all available plan types
   */
  async getPlanTypes(): Promise<any[]> {
    const planTypes = await this.planTypeRepository.find({
      order: { name: 'ASC' },
    });

    return planTypes.map(type => ({
      id: type.id,
      name: type.name,
      description: type.description,
      typical_duration_weeks: 4, // Default value
      difficulty_level: 'beginner', // Default value
    }));
  }

  private async buildPromptData(user: User, generatePlanDto: GeneratePlanDto): Promise<PlanGenerationPromptDto> {
    const memberDetail = user.memberDetail;

    const promptData: PlanGenerationPromptDto = {
      age: memberDetail.age,
      gender: user.gender,
      height: memberDetail.height,
      weight: memberDetail.weight,
      fitness_level: memberDetail.fitness_level,
      goal: generatePlanDto.goal,
      dietary_preference: memberDetail.dietary_preference,
      duration_days: generatePlanDto.duration_days || 28,
      target_weight: generatePlanDto.target_weight,
    };

    // Add historical data if requested
    if (generatePlanDto.include_history) {
      // Get previous plan performance
      const previousPlan = await this.acceptedPlanRepository.findOne({
        where: { user: { id: user.id }, status: AcceptedPlanStatus.COMPLETED },
        relations: ['feedback', 'analytics'],
        order: { completed_at: 'DESC' }
      });

      if (previousPlan?.analytics) {
        promptData.previous_plan_performance = {
          completion_rate: previousPlan.analytics.completion_rate,
          favorite_workouts: previousPlan.feedback?.favorite_workouts,
          disliked_elements: previousPlan.feedback?.least_favorite_workouts,
          challenges: previousPlan.feedback?.challenges_faced,
          weight_change: previousPlan.analytics.weight_change_kg,
        };
      }

      // Get user preferences
      const userPreferences = await this.userPreferencesService.getUserPreferences(user.id);
      if (userPreferences) {
        promptData.user_preferences = {
          optimal_workout_duration: userPreferences.optimal_workout_duration,
          preferred_workout_types: userPreferences.preferred_workout_types,
          difficulty_preference: userPreferences.difficulty_preference,
        };
      }
    }

    return promptData;
  }

  private async parseAndStorePlans(acceptedPlan: any, aiResponse: any): Promise<void> {
    try {
      if (aiResponse.workout_plan) {
        await this.parseAndStoreWorkoutPlans(acceptedPlan, aiResponse.workout_plan);
      }

      if (aiResponse.meal_plan) {
        await this.parseAndStoreMealPlans(acceptedPlan, aiResponse.meal_plan);
      }
    } catch (error) {
      this.logger.error('Failed to parse and store plans:', error);
      throw new Error('Failed to process generated plan data');
    }
  }

  private async parseAndStoreWorkoutPlans(acceptedPlan: any, workoutPlanData: any[]): Promise<void> {
    for (let i = 0; i < workoutPlanData.length; i++) {
      const dayData = workoutPlanData[i];
      
      const totalDuration = dayData.workouts?.reduce((sum: number, workout: any) => 
        sum + (workout.duration_minutes || 0), 0) || 0;

      const workoutPlan = this.workoutPlanRepository.create({
        acceptedPlan,
        day_number: i + 1,
        day_name: dayData.day,
        total_duration_minutes: totalDuration,
        notes: dayData.notes,
      });

      const savedWorkoutPlan = await this.workoutPlanRepository.save(workoutPlan);

      // Store exercises
      if (dayData.workouts) {
        for (let j = 0; j < dayData.workouts.length; j++) {
          const exerciseData = dayData.workouts[j];
          
          const exercise = this.workoutExerciseRepository.create({
            workoutPlan: savedWorkoutPlan,
            exercise_order: j + 1,
            name: exerciseData.name,
            type: exerciseData.type,
            duration_minutes: exerciseData.duration_minutes,
            sets: exerciseData.sets,
            reps: exerciseData.reps,
            weight: exerciseData.weight,
            muscle_groups: exerciseData.muscle_groups || [],
            calories_burned_estimate: exerciseData.calories_burned_estimate,
          });

          await this.workoutExerciseRepository.save(exercise);
        }
      }
    }
  }

  private async parseAndStoreMealPlans(acceptedPlan: any, mealPlanData: any[]): Promise<void> {
    for (let i = 0; i < mealPlanData.length; i++) {
      const dayData = mealPlanData[i];
      
      // Calculate totals
      const meals = dayData.meals || {};
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;
      let totalFiber = 0;

      const mealPlan = this.mealPlanRepository.create({
        acceptedPlan,
        day_number: i + 1,
        day_name: dayData.day,
        total_calories: 0, // Will be updated after processing meals
        notes: dayData.notes,
      });

      const savedMealPlan = await this.mealPlanRepository.save(mealPlan);

      // Store meals
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
      for (const mealType of mealTypes) {
        if (meals[mealType]) {
          const mealData = Array.isArray(meals[mealType]) ? meals[mealType] : [meals[mealType]];
          
          for (let j = 0; j < mealData.length; j++) {
            const meal = mealData[j];
            
            const mealItem = this.mealItemRepository.create({
              mealPlan: savedMealPlan,
              meal_type: mealType as any,
              meal_order: j + 1,
              name: meal.name,
              ingredients: meal.ingredients || [],
              calories: meal.calories || 0,
              protein: meal.protein,
              carbs: meal.carbs,
              fats: meal.fats,
              fiber: meal.fiber,
            });

            await this.mealItemRepository.save(mealItem);

            // Add to totals
            totalCalories += meal.calories || 0;
            totalProtein += meal.protein || 0;
            totalCarbs += meal.carbs || 0;
            totalFats += meal.fats || 0;
            totalFiber += meal.fiber || 0;
          }
        }
      }

      // Update meal plan totals
      savedMealPlan.total_calories = totalCalories;
      savedMealPlan.total_protein = totalProtein;
      savedMealPlan.total_carbs = totalCarbs;
      savedMealPlan.total_fats = totalFats;
      savedMealPlan.total_fiber = totalFiber;

      await this.mealPlanRepository.save(savedMealPlan);
    }
  }
}
