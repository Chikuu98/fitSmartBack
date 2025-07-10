# FitSmart Plans API Documentation

## Overview

The FitSmart Plans module provides a comprehensive AI-powered fitness and nutrition planning system. Users can generate personalized workout and meal plans using OpenAI, track their daily progress, provide feedback, and view detailed analytics.

## API Endpoints

### Plans Management (`/plans`)

#### Generate Plan
- **POST** `/plans/generate`
- Generate AI-powered workout and meal plans
- **Body**: `GeneratePlanDto`
- **Response**: Generated plan with OpenAI response

#### Accept Plan  
- **POST** `/plans/:planId/accept`
- Accept and activate a generated plan
- **Body**: `AcceptPlanDto`
- **Response**: Accepted plan details

#### Get Generated Plans
- **GET** `/plans/generated`
- Retrieve user's generated plans
- **Query**: `limit`, `offset`
- **Response**: Paginated list of generated plans

#### Get Accepted Plans
- **GET** `/plans/accepted`
- Retrieve user's accepted/active plans
- **Query**: `status` (optional)
- **Response**: List of accepted plans with progress

#### Get Specific Plans
- **GET** `/plans/generated/:id` - Get generated plan details
- **GET** `/plans/accepted/:id` - Get accepted plan with workout/meal details

#### Delete Plans
- **DELETE** `/plans/generated/:id` - Delete unaccepted generated plan
- **DELETE** `/plans/accepted/:id` - Cancel accepted plan

#### Get Plan Types
- **GET** `/plans/types`
- Get available plan types for generation

### Progress Tracking (`/progress`)

#### Daily Progress
- **POST** `/progress/daily/:acceptedPlanId`
- Create daily progress entry (weight, mood, energy, satisfaction)
- **Body**: `CreateDailyProgressDto`

- **GET** `/progress/daily/:acceptedPlanId`
- Get daily progress entries for a plan
- **Query**: `startDate`, `endDate` (optional)

- **PUT** `/progress/daily/:progressId`
- Update daily progress entry

- **DELETE** `/progress/daily/:progressId`
- Delete daily progress entry

#### Workout Progress
- **POST** `/progress/workout/:dailyProgressId`
- Record workout exercise progress
- **Body**: `CreateWorkoutProgressDto`

- **GET** `/progress/workout/:dailyProgressId`
- Get workout progress for a day

#### Meal Progress
- **POST** `/progress/meal/:dailyProgressId`
- Record meal consumption progress  
- **Body**: `CreateMealProgressDto`

- **GET** `/progress/meal/:dailyProgressId`
- Get meal progress for a day

#### Progress Summary
- **GET** `/progress/summary/:acceptedPlanId`
- Get aggregated progress statistics (completion rate, streaks, weight change)

### Feedback System (`/feedback`)

#### Submit Feedback
- **POST** `/feedback/:acceptedPlanId`
- Submit detailed plan feedback
- **Body**: `CreatePlanFeedbackDto`

#### Get Feedback
- **GET** `/feedback/:acceptedPlanId`
- Get feedback for specific plan

- **GET** `/feedback`
- Get all user feedback

#### Feedback Statistics
- **GET** `/feedback/stats/summary`
- Get aggregated feedback statistics for learning

#### Manage Feedback
- **PUT** `/feedback/:feedbackId` - Update feedback
- **DELETE** `/feedback/:feedbackId` - Delete feedback

### Analytics (`/analytics`)

#### Generate Analytics
- **POST** `/analytics/generate/:acceptedPlanId`
- Calculate comprehensive plan analytics

#### Get Analytics
- **GET** `/analytics/:acceptedPlanId`
- Get analytics for specific plan

- **GET** `/analytics`
- Get all user analytics

#### Analytics Summary
- **GET** `/analytics/summary/overview`
- Get aggregated analytics across all plans

#### Delete Analytics
- **DELETE** `/analytics/:acceptedPlanId`
- Delete analytics when plan is removed

## Data Flow

### 1. Plan Generation
```
User Request → OpenAI API → Parse Response → Store Plan → Return to User
```

### 2. Plan Acceptance & Tracking
```
Accept Plan → Create Workout/Meal Structures → Track Daily Progress → Generate Analytics
```

### 3. Learning Cycle
```
User Feedback → Update Preferences → Improve Future Generations
```

## Key Features

### AI-Powered Plan Generation
- Uses OpenAI to generate personalized plans
- Considers user preferences, history, and goals
- Supports both workout and meal planning

### Comprehensive Progress Tracking
- Daily progress with mood, energy, satisfaction metrics
- Detailed workout tracking (sets, reps, weight, duration)
- Meal tracking with portion sizes and satisfaction
- Progress photos and body measurements

### Advanced Analytics
- Completion rates and consistency scores
- Weight change tracking and trends
- Engagement metrics and improvement trends
- AI-generated insights and recommendations

### Feedback Learning System
- Detailed feedback collection
- Preference learning from user behavior
- Continuous improvement of plan generation

### Smart Recommendations
- Historical data analysis
- User preference evolution
- Goal-based plan suggestions

## Authentication

All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

## Response Formats

### Success Response
```json
{
  "data": { /* response data */ },
  "message": "Success message",
  "timestamp": "2025-07-10T10:00:00Z"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2025-07-10T10:00:00Z"
}
```

## Usage Examples

### 1. Generate a Weight Loss Plan
```json
POST /plans/generate
{
  "plan_type": "weight_loss",
  "goal": "lose_weight",
  "duration_days": 28,
  "target_weight": 70,
  "dietary_preferences": ["vegetarian"],
  "include_history": true
}
```

### 2. Track Daily Progress
```json
POST /progress/daily/1
{
  "progress_date": "2025-07-10",
  "day_number": 5,
  "current_weight": 72.5,
  "energy_level": "high",
  "mood": "good",
  "sleep_hours": 8,
  "water_intake_liters": 2.5,
  "overall_satisfaction": 8,
  "notes": "Great workout today!"
}
```

### 3. Submit Plan Feedback
```json
POST /feedback/1
{
  "overall_rating": 8,
  "difficulty_rating": 6,
  "enjoyment_rating": 9,
  "effectiveness_rating": 7,
  "goal_achievement": "fully_achieved",
  "would_recommend": true,
  "most_helpful_aspect": "Exercise variety",
  "suggested_improvements": "More quick meal options"
}
```

## Environment Variables

Required environment variables:
```
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4 # or gpt-3.5-turbo
JWT_SECRET=your_jwt_secret
```

## Database Tables

The module uses 13 main database tables:
- `plan_types` - Available plan categories
- `generated_plans` - AI-generated plans
- `accepted_plans` - User-accepted active plans
- `workout_plans` & `workout_exercises` - Workout structure
- `meal_plans` & `meal_items` - Meal structure
- `daily_progress` - Daily tracking entries
- `workout_progress` & `meal_progress` - Detailed exercise/meal tracking
- `plan_feedback` - User feedback
- `plan_analytics` - Calculated analytics
- `user_preferences` - Learned user preferences

## Future Enhancements

- Real-time notifications for plan milestones
- Social features for plan sharing
- Integration with fitness wearables
- Advanced AI insights and coaching
- Nutritionist and trainer marketplace integration
