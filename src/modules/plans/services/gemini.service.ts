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
    
    // Initialize Gemini 2.0 Flash with structured output configuration
    // Note: Using gemini-2.0-flash-exp which supports structured output
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp', // Latest model with structured output support
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
        responseMimeType: 'application/json', // Force JSON response
        responseSchema: FitnessPlanSchema, // Enforce our schema
      },
    });
  }

  /**
   * Generate a personalized fitness plan using Gemini AI
   * Returns structured JSON matching FitnessPlanResponse interface
   */
  async generatePlan(promptData: PlanGenerationPromptDto): Promise<{
    response: FitnessPlanResponse;
    model: string;
  }> {
    try {
      const prompt = this.buildPrompt(promptData);
      
      this.logger.log('Generating fitness plan with Gemini 2.0 Flash...');
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse the guaranteed JSON response
      const parsedResponse: FitnessPlanResponse = JSON.parse(text);

      // Validate we got the expected structure
      if (!parsedResponse.workout_plan || !parsedResponse.meal_plan) {
        throw new Error('Invalid response structure from Gemini API');
      }

      this.logger.log(
        `Successfully generated ${parsedResponse.workout_plan.length}-day plan with structured output`
      );

      return {
        response: parsedResponse,
        model: 'gemini-2.0-flash-exp',
      };
    } catch (error) {
      this.logger.error('Failed to generate plan with Gemini:', error);
      
      // Provide more detailed error information
      if (error.message?.includes('API key')) {
        throw new Error('Invalid or missing Gemini API key');
      }
      
      throw new Error(`Plan generation failed: ${error.message}`);
    }
  }

  /**
   * Build the comprehensive prompt for Gemini AI
   * Note: No need to explicitly ask for JSON format - schema handles it
   */
  private buildPrompt(data: PlanGenerationPromptDto): string {
    let prompt = `You are a certified fitness and nutrition expert with extensive experience in personalized training and meal planning.

Generate a comprehensive ${data.duration_days}-day workout and meal plan based on the following user profile:

USER PROFILE:
- Goal: ${data.goal}${data.target_weight ? ` (Target weight: ${data.target_weight}kg)` : ''}
- Physical Stats: ${data.age} years old, ${data.gender}, ${data.height}cm tall, ${data.weight}kg current weight
- Fitness Level: ${data.fitness_level}
- Dietary Preference: ${data.dietary_preference}`;

    // Add previous plan performance for continuous improvement
    if (data.previous_plan_performance) {
      prompt += `\n\nPREVIOUS PLAN PERFORMANCE ANALYSIS:
- Completion Rate: ${data.previous_plan_performance.completion_rate || 'N/A'}%
- Favorite Workouts: ${data.previous_plan_performance.favorite_workouts || 'N/A'}
- Disliked Elements: ${data.previous_plan_performance.disliked_elements || 'N/A'}
- Challenges Faced: ${data.previous_plan_performance.challenges || 'N/A'}
- Weight Change: ${data.previous_plan_performance.weight_change || 'N/A'}kg

Please adjust the new plan based on this feedback to improve adherence and results.`;
    }

    // Add learned preferences for better personalization
    if (data.user_preferences) {
      prompt += `\n\nLEARNED USER PREFERENCES:
- Optimal Workout Duration: ${data.user_preferences.optimal_workout_duration || 'N/A'} minutes
- Preferred Workout Types: ${data.user_preferences.preferred_workout_types || 'N/A'}
- Difficulty Preference: ${data.user_preferences.difficulty_preference || 'N/A'}

Incorporate these preferences to maximize engagement and success.`;
    }

    // Calculate and provide target calories
    const targetCalories = this.calculateTargetCalories(data);
    
    prompt += `\n\nPLAN REQUIREMENTS:

WORKOUT PLAN (${data.duration_days} days):
- Progressive difficulty appropriate for ${data.fitness_level} level
- Variety of exercises targeting all major muscle groups
- Include cardio, strength, and flexibility work
- Realistic time commitments and recovery periods
- Calorie burn estimates based on user's weight and intensity

MEAL PLAN (${data.duration_days} days):
- Target daily calories: approximately ${targetCalories} kcal
- Aligned with ${data.goal.toLowerCase()} goal
- Respects ${data.dietary_preference} dietary preferences
- Balanced macronutrients (protein, carbs, fats, fiber)
- Practical ingredients and preparation methods
- Include breakfast, lunch, dinner, and healthy snacks

IMPORTANT: Focus on creating sustainable, enjoyable plans that the user can stick to long-term. Consider their feedback from previous plans and adjust accordingly.`;

    return prompt;
  }

  /**
   * Calculate target daily calories using Mifflin-St Jeor equation
   * Adjusted for activity level and fitness goals
   */
  private calculateTargetCalories(data: PlanGenerationPromptDto): number {
    // Mifflin-St Jeor BMR calculation
    let bmr: number;
    if (data.gender.toLowerCase() === 'male') {
      bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
    } else {
      bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    }

    // Activity multipliers based on fitness level as proxy
    const activityFactors = {
      'beginner': 1.375,      // Lightly active
      'intermediate': 1.55,    // Moderately active
      'advanced': 1.725,       // Very active
    };

    // Use fitness level to estimate activity, default to moderate
    const fitnessLevel = data.fitness_level?.toLowerCase() || 'intermediate';
    const activityFactor = activityFactors[fitnessLevel] || activityFactors['intermediate'];
    
    let targetCalories = bmr * activityFactor;

    // Adjust based on fitness goal
    const goalLower = data.goal.toLowerCase();
    
    if (goalLower.includes('lose') || goalLower.includes('weight loss') || goalLower.includes('cut')) {
      targetCalories -= 500; // 500 cal deficit for ~0.5kg/week loss
    } else if (goalLower.includes('gain') || goalLower.includes('build') || goalLower.includes('bulk')) {
      targetCalories += 300; // 300 cal surplus for lean muscle gain
    } else if (goalLower.includes('maintain')) {
      // Keep at maintenance level
    } else {
      // Default: slight deficit for general fitness
      targetCalories -= 200;
    }

    return Math.round(targetCalories);
  }

  /**
   * Test connection to Gemini API
   * Useful for health checks and debugging
   */
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
