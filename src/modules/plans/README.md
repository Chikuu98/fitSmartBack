# FitSmart Plans Database Schema

## Overview

This document describes the comprehensive database schema for the FitSmart workout and meal plan generation system. The system leverages OpenAI's API to generate personalized plans and provides detailed tracking and feedback mechanisms.

## Core Workflow

1. **User Profile Setup**: Users register and provide detailed profile information
2. **Plan Generation**: System sends profile data to OpenAI API for plan generation
3. **Plan Storage**: Generated plans are stored even before user acceptance
4. **Plan Acceptance**: Users can accept generated plans, making them active
5. **Progress Tracking**: Daily workout and meal progress tracking
6. **Feedback Collection**: Comprehensive feedback after plan completion
7. **Learning & Improvement**: System learns from feedback to improve future plans

## Database Schema

### 1. User Profile Enhancement

#### Enhanced Member Details (`member_details`)
Extended the existing member details table with plan-specific fields:

```sql
-- New fields added to existing member_details table
allergies TEXT -- JSON array of user allergies
preferred_workouts TEXT -- JSON array of preferred workout types
available_equipment TEXT -- JSON array of available equipment
daily_time_available INT -- Available time in minutes per day
activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')
```

### 2. Plan Management Tables

#### Plan Types (`plan_types`)
Normalizes plan types for better organization:
- `id` - Primary key
- `name` - Type name (workout, meal, combined)
- `description` - Type description
- `created_at` - Creation timestamp

#### Generated Plans (`generated_plans`)
Stores all AI-generated plans regardless of acceptance status:
- Complete OpenAI API interaction logs
- Generation metadata (model used, cost, etc.)
- Error handling for failed generations
- Links to user profile data used for generation

#### Accepted Plans (`accepted_plans`)
Tracks plans that users have accepted and are actively following:
- Reference to generated plan
- Plan duration and goals
- Progress tracking
- Status management (active, completed, paused, cancelled)
- Links to previous plans for progression tracking

### 3. Workout Management

#### Workout Plans (`workout_plans`)
Daily workout structure within accepted plans:
- Day-by-day workout organization
- Total duration and difficulty tracking
- Daily notes and instructions

#### Workout Exercises (`workout_exercises`)
Individual exercises within each workout day:
- Detailed exercise specifications (sets, reps, duration)
- Equipment requirements and muscle groups
- Instructions and reference materials
- Calorie burn estimates

#### Workout Progress (`workout_progress`)
Detailed tracking of exercise completion:
- Real-time status tracking
- Actual vs. planned performance metrics
- User ratings for difficulty and enjoyment
- Heart rate and calorie tracking
- Timing data (started/completed)

### 4. Meal Management

#### Meal Plans (`meal_plans`)
Daily meal structure within accepted plans:
- Nutritional totals (calories, macros)
- Day-by-day meal organization

#### Meal Items (`meal_items`)
Individual meals and snacks:
- Detailed nutritional information
- Ingredient lists and preparation instructions
- Dietary tags and allergen information
- Preparation and cooking times

#### Meal Progress (`meal_progress`)
Detailed tracking of meal consumption:
- Portion tracking (percentage consumed)
- Hunger and satisfaction ratings
- Ingredient substitutions
- Actual calorie intake calculation

### 5. Progress Tracking

#### Daily Progress (`daily_progress`)
Comprehensive daily health and progress tracking:
- Weight and body measurements
- Sleep quality and duration
- Energy levels and mood
- Water intake and stress levels
- Progress photos and notes
- Overall daily satisfaction ratings

### 6. Feedback and Analytics

#### Plan Feedback (`plan_feedback`)
Comprehensive post-plan feedback collection:
- Multi-dimensional ratings (overall, difficulty, enjoyment, effectiveness)
- Goal achievement assessment
- Favorite and least favorite elements
- Detailed qualitative feedback
- Self-reported adherence and challenges

#### Plan Analytics (`plan_analytics`)
Computed metrics and AI insights:
- Completion rates and consistency scores
- Performance trends and patterns
- AI-generated insights and recommendations
- Preparation data for next plan generation

#### User Preferences (`user_preferences`)
Learned user preferences over time:
- Workout and meal preferences with confidence scores
- Optimal timing and duration patterns
- Motivation factors and difficulty preferences
- Continuous learning confidence tracking

## Key Relationships

```
users (1) ←→ (1) member_details [Enhanced with plan fields]
users (1) ←→ (N) generated_plans
generated_plans (1) ←→ (1) accepted_plans
accepted_plans (1) ←→ (N) workout_plans
accepted_plans (1) ←→ (N) meal_plans
workout_plans (1) ←→ (N) workout_exercises
meal_plans (1) ←→ (N) meal_items
accepted_plans (1) ←→ (N) daily_progress
daily_progress (1) ←→ (N) workout_progress
daily_progress (1) ←→ (N) meal_progress
accepted_plans (1) ←→ (1) plan_feedback
accepted_plans (1) ←→ (1) plan_analytics
users (1) ←→ (1) user_preferences
```

## Key Features

### 1. Comprehensive Tracking
- **Granular Progress**: Track individual exercises and meals
- **Holistic Health**: Include sleep, mood, stress, and energy
- **Photo Progress**: Support for progress photo tracking
- **Flexible Duration**: Support for 7-day and custom duration plans

### 2. Advanced Analytics
- **Performance Metrics**: Completion rates, consistency scores
- **Trend Analysis**: Track improvement patterns over time
- **AI Insights**: Generate insights for plan optimization
- **Predictive Learning**: Build user preference profiles

### 3. Intelligent Plan Generation
- **Historical Context**: Include previous plan data in API calls
- **Preference Learning**: Apply learned preferences to new plans
- **Feedback Integration**: Use detailed feedback for improvements
- **Cost Tracking**: Monitor API usage and costs

### 4. User Experience Optimization
- **Flexible Status Management**: Support plan pausing/resuming
- **Substitution Tracking**: Handle ingredient/exercise substitutions
- **Rating Systems**: Multi-dimensional feedback collection
- **Goal Progression**: Track goal achievement over multiple plans

## OpenAI Integration Strategy

### Enhanced Prompt Generation
When generating new plans, the system will include:

1. **Current User Profile**: All member detail fields
2. **Previous Plan Performance**: Analytics and completion data
3. **User Preferences**: Learned preferences with confidence scores
4. **Feedback History**: Relevant feedback from previous plans
5. **Goal Progression**: Progress toward long-term goals

### Example Enhanced Prompt Structure:
```
You are a certified fitness and nutrition expert with access to detailed user history.

USER PROFILE:
- Goal: [goal] (Previous achievement: [goal_achievement])
- Physical: [age], [gender], [height], [weight]
- Fitness: [fitness_level], [activity_level]
- Preferences: [dietary_preference], Equipment: [available_equipment]
- Time Available: [daily_time_available] minutes
- Allergies: [allergies]

PREVIOUS PLAN PERFORMANCE:
- Completion Rate: [completion_rate]%
- Favorite Workouts: [favorite_workouts]
- Disliked Elements: [least_favorite_workouts], [least_favorite_meals]
- Challenges: [challenges_faced]
- Weight Change: [weight_change_kg]kg

LEARNED PREFERENCES:
- Optimal Workout Duration: [optimal_workout_duration] minutes
- Preferred Workout Types: [preferred_workout_types]
- Difficulty Preference: [difficulty_preference]

Generate a personalized 7-day plan considering this history...
```

## Migration and Deployment

### Migration Order
1. `1752009000000-enhance-member-details-for-plans.ts`
2. `1752010000000-create-plan-types-table.ts`
3. `1752011000000-create-generated-plans-table.ts`
4. `1752012000000-create-accepted-plans-table.ts`
5. `1752013000000-create-workout-plans-table.ts`
6. `1752014000000-create-meal-plans-table.ts`
7. `1752015000000-create-daily-progress-table.ts`
8. `1752016000000-create-plan-feedback-table.ts`

### Performance Considerations
- **Indexing**: Comprehensive indexing on frequently queried columns
- **JSON Storage**: Use JSON columns for flexible data storage
- **Partitioning**: Consider partitioning large tables by date
- **Archival**: Implement archival strategy for old plans

## API Endpoints Suggestions

### Plan Generation
- `POST /api/plans/generate` - Generate new plan
- `POST /api/plans/{id}/accept` - Accept generated plan
- `GET /api/plans/history` - Get user's plan history

### Progress Tracking
- `POST /api/progress/daily` - Log daily progress
- `POST /api/progress/workout` - Log workout progress
- `POST /api/progress/meal` - Log meal progress

### Feedback
- `POST /api/plans/{id}/feedback` - Submit plan feedback
- `GET /api/analytics/user` - Get user analytics
- `GET /api/preferences/user` - Get learned preferences

## Security and Privacy
- **Data Encryption**: Encrypt sensitive health data
- **Access Control**: Implement proper user data isolation
- **Data Retention**: Define retention policies for historical data
- **GDPR Compliance**: Ensure compliance with data protection regulations
