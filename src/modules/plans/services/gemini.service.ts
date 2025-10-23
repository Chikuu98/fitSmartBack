import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PlanGenerationPromptDto } from '../dto/generate-plan.dto';
import { FitnessPlanResponse } from '../interfaces/plan-response.interface';
import { FitnessPlanSchema } from '../schemas/gemini-response.schema';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16000,
        responseMimeType: 'application/json',
        responseSchema: FitnessPlanSchema,
      },
    });
  }

  async generatePlan(promptData: PlanGenerationPromptDto): Promise<{
    response: FitnessPlanResponse;
    model: string;
  }> {
    try {
      const requestedDays = promptData.duration_days;
      const generateDays = requestedDays > 7 ? 7 : requestedDays;
      
      const modifiedPromptData = { ...promptData, duration_days: generateDays };
      const prompt = this.buildPrompt(modifiedPromptData);

      this.logger.log(`Generating ${generateDays}-day fitness plan with Gemini 2.0 Flash (requested: ${requestedDays} days)...`);

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      this.logger.log(`Received response with ${text.length} characters`);

      // Check if response is empty or incomplete
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }

      let parsedResponse: FitnessPlanResponse;
      
      try {
        parsedResponse = JSON.parse(text);
      } catch (parseError) {
        this.logger.error('Failed to parse JSON response:', text.substring(0, 500));
        throw new Error('Invalid JSON response from Gemini API. The response may be incomplete.');
      }

      if (!parsedResponse.workout_plan || !parsedResponse.meal_plan) {
        this.logger.error('Invalid response structure:', parsedResponse);
        throw new Error('Invalid response structure from Gemini API');
      }

      if (requestedDays > generateDays) {
        parsedResponse = this.repeatPlan(parsedResponse, requestedDays);
        this.logger.log(`Extended ${generateDays}-day plan to ${requestedDays} days by repeating`);
      }

      this.logger.log(
        `Successfully generated ${parsedResponse.workout_plan.length}-day plan with structured output`,
      );

      return {
        response: parsedResponse,
        model: 'gemini-2.0-flash-exp',
      };
    } catch (error) {
      this.logger.error('Failed to generate plan with Gemini:', error);

      if (error.message?.includes('API key')) {
        throw new Error('Invalid or missing Gemini API key');
      }

      throw new Error(`Plan generation failed: ${error.message}`);
    }
  }

  private repeatPlan(
    basePlan: FitnessPlanResponse,
    targetDays: number,
  ): FitnessPlanResponse {
    const baseDays = basePlan.workout_plan.length;
    const workoutPlan = [...basePlan.workout_plan];
    const mealPlan = [...basePlan.meal_plan];

    let currentDay = baseDays + 1;
    
    while (workoutPlan.length < targetDays) {
      const cycleIndex = (workoutPlan.length) % baseDays;
      
      const originalWorkout = basePlan.workout_plan[cycleIndex];
      const newWorkout = {
        ...originalWorkout,
        day: `Day ${currentDay}`,
      };
      workoutPlan.push(newWorkout);

      const originalMeal = basePlan.meal_plan[cycleIndex];
      const newMeal = {
        ...originalMeal,
        day: `Day ${currentDay}`,
      };
      mealPlan.push(newMeal);

      currentDay++;
    }

    return {
      workout_plan: workoutPlan,
      meal_plan: mealPlan,
    };
  }


  private buildPrompt(data: PlanGenerationPromptDto): string {
    let prompt = `You are a certified fitness and nutrition expert. Generate a ${data.duration_days}-day workout and meal plan.

USER PROFILE:
- Goal: ${data.goal}${data.target_weight ? ` (Target: ${data.target_weight}kg)` : ''}
- Age: ${data.age}, Gender: ${data.gender}, Height: ${data.height}cm, Weight: ${data.weight}kg
- Fitness Level: ${data.fitness_level}
- Diet: ${data.dietary_preference}`;

    // Add previous plan performance if available
    if (data.previous_plan_performance) {
      prompt += `\n\nPREVIOUS PERFORMANCE:
- Completion: ${data.previous_plan_performance.completion_rate || 'N/A'}%
- Favorites: ${data.previous_plan_performance.favorite_workouts || 'N/A'}
- Dislikes: ${data.previous_plan_performance.disliked_elements || 'N/A'}
- Weight Change: ${data.previous_plan_performance.weight_change || 'N/A'}kg

Adjust based on this feedback.`;
    }

    // Add learned preferences if available
    if (data.user_preferences) {
      prompt += `\n\nPREFERENCES:
- Duration: ${data.user_preferences.optimal_workout_duration || 'N/A'} min
- Types: ${data.user_preferences.preferred_workout_types || 'N/A'}
- Difficulty: ${data.user_preferences.difficulty_preference || 'N/A'}`;
    }

    const targetCalories = this.calculateTargetCalories(data);

    prompt += `\n\nREQUIREMENTS:
- ${data.duration_days} days of workouts (variety, progressive difficulty, all muscle groups)
- ${data.duration_days} days of meals (${targetCalories} kcal/day, respects ${data.dietary_preference})
- Keep descriptions concise
- Include essential nutritional info (calories, protein, carbs, fats)
- Practical exercises and meals`;

    return prompt;
  }

  private calculateTargetCalories(data: PlanGenerationPromptDto): number {
    // Mifflin-St Jeor BMR calculation
    let bmr: number;
    if (data.gender.toLowerCase() === 'male') {
      bmr =
        88.362 + 13.397 * data.weight + 4.799 * data.height - 5.677 * data.age;
    } else {
      bmr =
        447.593 + 9.247 * data.weight + 3.098 * data.height - 4.33 * data.age;
    }

    const activityFactors = {
      beginner: 1.375,
      intermediate: 1.55,
      advanced: 1.725,
    };

    const fitnessLevel = data.fitness_level?.toLowerCase() || 'intermediate';
    const activityFactor =
      activityFactors[fitnessLevel] || activityFactors['intermediate'];

    let targetCalories = bmr * activityFactor;

    const goalLower = data.goal.toLowerCase();

    if (
      goalLower.includes('lose') ||
      goalLower.includes('weight loss') ||
      goalLower.includes('cut')
    ) {
      targetCalories -= 500;
    } else if (
      goalLower.includes('gain') ||
      goalLower.includes('build') ||
      goalLower.includes('bulk')
    ) {
      targetCalories += 300;
    } else if (goalLower.includes('maintain')) {
      // Keep
    } else {
      targetCalories -= 200;
    }

    return Math.round(targetCalories);
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Hello');
      return !!result.response.text();
    } catch (error) {
      this.logger.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}
