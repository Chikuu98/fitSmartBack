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
  private readonly fallbackModels: string[];

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    this.fallbackModels = [
      this.configService.get<string>('GEMINI_PRIMARY_MODEL') || 'gemini-2.5-flash',
      this.configService.get<string>('GEMINI_SECONDARY_MODEL') || 'gemini-2.0-flash',
      this.configService.get<string>('GEMINI_TERTIARY_MODEL') || 'gemini-2.0-flash-exp',
      this.configService.get<string>('GEMINI_FALLBACK_MODEL') || 'gemini-2.5-pro',
    ].filter((model, index, self) => model && self.indexOf(model) === index);

    this.logger.log(`Initialized with fallback models: ${this.fallbackModels.join(' → ')}`);
  }

  private createModel(modelName: string) {
    return this.genAI.getGenerativeModel({
      model: modelName,
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
    const requestedDays = promptData.duration_days;
    const generateDays = requestedDays > 7 ? 7 : requestedDays;
    const modifiedPromptData = { ...promptData, duration_days: generateDays };
    const prompt = this.buildPrompt(modifiedPromptData);

    for (let modelIndex = 0; modelIndex < this.fallbackModels.length; modelIndex++) {
      const currentModel = this.fallbackModels[modelIndex];
      const maxRetriesPerModel = 2;
      const baseDelay = 1000;

      this.logger.log(
        `Attempting with model [${modelIndex + 1}/${this.fallbackModels.length}]: ${currentModel}`,
      );

      for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
        try {
          this.logger.log(
            `Generating ${generateDays}-day fitness plan with ${currentModel} (requested: ${requestedDays} days) - Attempt ${attempt}/${maxRetriesPerModel}...`,
          );

          const model = this.createModel(currentModel);
          const result = await model.generateContent(prompt);
          const response = result.response;
          const text = response.text();

          this.logger.log(`Received response with ${text.length} characters from ${currentModel}`);

          if (!text || text.trim().length === 0) {
            throw new Error('Empty response from Gemini API');
          }

          let parsedResponse: FitnessPlanResponse;

          try {
            parsedResponse = JSON.parse(text);
          } catch (parseError) {
            this.logger.error('Failed to parse JSON response:', text.substring(0, 500));
            throw new Error(
              'Invalid JSON response from Gemini API. The response may be incomplete.',
            );
          }

          if (!parsedResponse.workout_plan || !parsedResponse.meal_plan) {
            this.logger.error('Invalid response structure:', parsedResponse);
            throw new Error('Invalid response structure from Gemini API');
          }

          if (requestedDays > generateDays) {
            parsedResponse = this.repeatPlan(parsedResponse, requestedDays);
            this.logger.log(
              `Extended ${generateDays}-day plan to ${requestedDays} days by repeating`,
            );
          }

          this.logger.log(
            `Successfully generated ${parsedResponse.workout_plan.length}-day plan using ${currentModel}`,
          );

          return {
            response: parsedResponse,
            model: currentModel,
          };
        } catch (error) {
          const isRateLimitError = 
            error.status === 429 || 
            error.message?.includes('rate limit') || 
            error.message?.includes('quota') ||
            error.message?.includes('429');
          
          const isOverloadError = 
            error.status === 503 || 
            error.message?.includes('overloaded') || 
            error.message?.includes('503');
          
          const isLastAttempt = attempt === maxRetriesPerModel;
          const isLastModel = modelIndex === this.fallbackModels.length - 1;

          this.logger.error(
            `Failed with ${currentModel} (Attempt ${attempt}/${maxRetriesPerModel}):`,
            error.message,
          );

          if ((isRateLimitError || isOverloadError) && !isLastModel) {
            this.logger.warn(
              `${isRateLimitError ? 'Rate limit' : 'Overload'} detected on ${currentModel}. Switching to next model...`,
            );
            break;
          }

          if (!isLastAttempt && !isLastModel) {
            const delay = baseDelay * Math.pow(2, attempt - 1);
            this.logger.warn(`Retrying ${currentModel} in ${delay}ms...`);
            await this.sleep(delay);
            continue;
          }

          if (isLastModel && isLastAttempt) {
            if (error.message?.includes('API key')) {
              throw new Error('Invalid or missing Gemini API key');
            }

            if (isRateLimitError) {
              throw new Error(
                'All Gemini models are rate-limited. Please try again in a few minutes.',
              );
            }

            if (isOverloadError) {
              throw new Error(
                'All Gemini models are currently overloaded. Please try again later.',
              );
            }

            throw new Error(`Plan generation failed with all models: ${error.message}`);
          }
        }
      }
    }

    throw new Error('Plan generation failed after trying all fallback models');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

    if (data.custom_prompt && data.custom_prompt.trim()) {
      prompt += `\n\nADDITIONAL INSTRUCTIONS:
${data.custom_prompt.trim()}`;
    }

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
      const model = this.createModel(this.fallbackModels[0]);
      const result = await model.generateContent('Hello');
      return !!result.response.text();
    } catch (error) {
      this.logger.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}
