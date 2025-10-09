import { SchemaType } from '@google/generative-ai';
import type { Schema } from '@google/generative-ai';

export const FitnessPlanSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    workout_plan: {
      type: SchemaType.ARRAY,
      description: 'Array of daily workout plans',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day: {
            type: SchemaType.STRING,
            description: 'Day identifier (e.g., "Monday", "Day 1")',
          },
          workouts: {
            type: SchemaType.ARRAY,
            description: 'List of exercises for the day',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: {
                  type: SchemaType.STRING,
                  description: 'Exercise name',
                },
                type: {
                  type: SchemaType.STRING,
                  description: 'Exercise type (cardio, strength, flexibility, etc.)',
                },
                duration_minutes: {
                  type: SchemaType.NUMBER,
                  description: 'Duration in minutes',
                },
                sets: {
                  type: SchemaType.NUMBER,
                  description: 'Number of sets (optional for cardio)',
                  nullable: true,
                },
                reps: {
                  type: SchemaType.NUMBER,
                  description: 'Number of repetitions per set (optional)',
                  nullable: true,
                },
                weight: {
                  type: SchemaType.NUMBER,
                  description: 'Weight in kg (optional)',
                  nullable: true,
                },
                muscle_groups: {
                  type: SchemaType.ARRAY,
                  description: 'Target muscle groups',
                  items: {
                    type: SchemaType.STRING,
                  },
                },
                calories_burned_estimate: {
                  type: SchemaType.NUMBER,
                  description: 'Estimated calories burned',
                },
              },
              required: [
                'name',
                'type',
                'duration_minutes',
                'muscle_groups',
                'calories_burned_estimate',
              ],
            },
          },
        },
        required: ['day', 'workouts'],
      },
    },
    meal_plan: {
      type: SchemaType.ARRAY,
      description: 'Array of daily meal plans',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day: {
            type: SchemaType.STRING,
            description: 'Day identifier (e.g., "Monday", "Day 1")',
          },
          meals: {
            type: SchemaType.OBJECT,
            description: 'Meals for the day',
            properties: {
              breakfast: {
                type: SchemaType.OBJECT,
                properties: {
                  name: {
                    type: SchemaType.STRING,
                    description: 'Meal name',
                  },
                  ingredients: {
                    type: SchemaType.ARRAY,
                    description: 'List of ingredients with quantities',
                    items: {
                      type: SchemaType.STRING,
                    },
                  },
                  calories: {
                    type: SchemaType.NUMBER,
                    description: 'Total calories',
                  },
                  protein: {
                    type: SchemaType.NUMBER,
                    description: 'Protein in grams',
                  },
                  carbs: {
                    type: SchemaType.NUMBER,
                    description: 'Carbohydrates in grams',
                  },
                  fats: {
                    type: SchemaType.NUMBER,
                    description: 'Fats in grams',
                  },
                  fiber: {
                    type: SchemaType.NUMBER,
                    description: 'Fiber in grams',
                  },
                },
                required: ['name', 'ingredients', 'calories', 'protein', 'carbs', 'fats', 'fiber'],
              },
              lunch: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  calories: { type: SchemaType.NUMBER },
                  protein: { type: SchemaType.NUMBER },
                  carbs: { type: SchemaType.NUMBER },
                  fats: { type: SchemaType.NUMBER },
                  fiber: { type: SchemaType.NUMBER },
                },
                required: ['name', 'ingredients', 'calories', 'protein', 'carbs', 'fats', 'fiber'],
              },
              dinner: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  calories: { type: SchemaType.NUMBER },
                  protein: { type: SchemaType.NUMBER },
                  carbs: { type: SchemaType.NUMBER },
                  fats: { type: SchemaType.NUMBER },
                  fiber: { type: SchemaType.NUMBER },
                },
                required: ['name', 'ingredients', 'calories', 'protein', 'carbs', 'fats', 'fiber'],
              },
              snacks: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  calories: { type: SchemaType.NUMBER },
                  protein: { type: SchemaType.NUMBER },
                  carbs: { type: SchemaType.NUMBER },
                  fats: { type: SchemaType.NUMBER },
                  fiber: { type: SchemaType.NUMBER },
                },
                required: ['name', 'ingredients', 'calories', 'protein', 'carbs', 'fats', 'fiber'],
              },
            },
            required: ['breakfast', 'lunch', 'dinner', 'snacks'],
          },
        },
        required: ['day', 'meals'],
      },
    },
  },
  required: ['workout_plan', 'meal_plan'],
};
