import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PlanGenerationPromptDto } from '../dto/generate-plan.dto';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generatePlan(promptData: PlanGenerationPromptDto): Promise<{
    response: any;
    model: string;
  }> {
    try {
      const prompt = this.buildPrompt(promptData);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a certified fitness and nutrition expert. Generate comprehensive, personalized workout and meal plans based on user profiles and history.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const response = completion.choices[0].message.content;
      
      // Parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response ?? '');
      } catch (parseError) {
        this.logger.warn('Failed to parse OpenAI response as JSON, returning raw response');
        parsedResponse = { raw_response: response };
      }

      return {
        response: parsedResponse,
        model: 'gpt-4'
      };
    } catch (error) {
      this.logger.error('Failed to generate plan with OpenAI:', error);
      throw new Error(`Plan generation failed: ${error.message}`);
    }
  }

  private buildPrompt(data: PlanGenerationPromptDto): string {
    let prompt = `You are a certified fitness and nutrition expert with access to detailed user history.

Generate a personalized ${data.duration_days}-day workout and meal plan based on the following user profile:

USER PROFILE:
- Goal: ${data.goal}${data.target_weight ? ` (Target weight: ${data.target_weight}kg)` : ''}
- Physical: ${data.age} years old, ${data.gender}, ${data.height}cm, ${data.weight}kg
- Fitness: ${data.fitness_level} level
- Dietary Preference: ${data.dietary_preference}`;

    // Add previous plan performance if available
    if (data.previous_plan_performance) {
      prompt += `\n\nPREVIOUS PLAN PERFORMANCE:
- Completion Rate: ${data.previous_plan_performance.completion_rate || 'N/A'}%
- Favorite Workouts: ${data.previous_plan_performance.favorite_workouts || 'N/A'}
- Disliked Elements: ${data.previous_plan_performance.disliked_elements || 'N/A'}
- Challenges: ${data.previous_plan_performance.challenges || 'N/A'}
- Weight Change: ${data.previous_plan_performance.weight_change || 'N/A'}kg`;
    }

    // Add learned preferences if available
    if (data.user_preferences) {
      prompt += `\n\nLEARNED PREFERENCES:
- Optimal Workout Duration: ${data.user_preferences.optimal_workout_duration || 'N/A'} minutes
- Preferred Workout Types: ${data.user_preferences.preferred_workout_types || 'N/A'}
- Difficulty Preference: ${data.user_preferences.difficulty_preference || 'N/A'}`;
    }

    prompt += `\n\nReturn the response in **JSON format** with exactly two top-level keys:

1. \`workout_plan\`: An array of ${data.duration_days} days. Each day includes:
   - \`day\`: (e.g., "Monday", "Day 1")
   - \`workouts\`: an array of exercises with:
     - \`name\`
     - \`type\` (e.g., cardio, strength, flexibility)
     - \`duration_minutes\`
     - \`sets\` (if applicable)
     - \`reps\` (if applicable)
     - \`weight\` (if applicable)
     - \`muscle_groups\` (array)
     - \`calories_burned_estimate\`

2. \`meal_plan\`: An array of ${data.duration_days} days. Each day includes:
   - \`day\`: (e.g., "Monday", "Day 1")
   - \`meals\`: an object with:
     - \`breakfast\`, \`lunch\`, \`dinner\`, \`snacks\`
       - For each meal: include
         - \`name\`
         - \`ingredients\` (array with quantities)
         - \`calories\` (number)
         - \`protein\` (grams)
         - \`carbs\` (grams)
         - \`fats\` (grams)
         - \`fiber\` (grams)

Total daily calories should average around ${this.calculateTargetCalories(data)} kcal and be suitable for ${data.goal.toLowerCase()}.

Ensure the JSON is clean, complete, and properly structured. No extra commentary—only the JSON output.`;

    return prompt;
  }

  private calculateTargetCalories(data: PlanGenerationPromptDto): number {
    // Basic BMR calculation using Mifflin-St Jeor equation
    let bmr: number;
    if (data.gender.toLowerCase() === 'male') {
      bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
    } else {
      bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    }

    // Activity factor - using moderate activity as default since we don't have this data
    const activityFactors = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725,
      'extra_active': 1.9
    };

    // Default to moderately active since we removed activity_level field
    const activityFactor = activityFactors['moderately_active'];
    let targetCalories = bmr * activityFactor;

    // Adjust based on goal
    if (data.goal.toLowerCase().includes('lose') || data.goal.toLowerCase().includes('weight loss')) {
      targetCalories -= 500; // Deficit for weight loss
    } else if (data.goal.toLowerCase().includes('gain') || data.goal.toLowerCase().includes('build')) {
      targetCalories += 300; // Surplus for weight gain
    }

    return Math.round(targetCalories);
  }
}
