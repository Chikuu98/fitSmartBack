import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePlanFeedbackTable1752016000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create plan_feedback table
    await queryRunner.createTable(
      new Table({
        name: 'plan_feedback',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int'
          },
          {
            name: 'accepted_plan_id',
            type: 'int'
          },
          {
            name: 'overall_rating',
            type: 'int',
            comment: 'Overall plan rating 1-10'
          },
          {
            name: 'goal_achievement',
            type: 'enum',
            enum: ['not_achieved', 'partially_achieved', 'fully_achieved', 'exceeded'],
            comment: 'How well the plan helped achieve goals'
          },
          {
            name: 'would_recommend',
            type: 'boolean',
            default: false
          },
          {
            name: 'additional_comments',
            type: 'text',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          }
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['accepted_plan_id'],
            referencedTableName: 'accepted_plans',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }
        ],
        indices: [
          {
            name: 'IDX_plan_feedback_user_plan',
            columnNames: ['user_id', 'accepted_plan_id'],
            isUnique: true
          }
        ]
      }),
      true,
    );

    // Create plan_analytics table for computed metrics
    await queryRunner.createTable(
      new Table({
        name: 'plan_analytics',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'accepted_plan_id',
            type: 'int',
            isUnique: true
          },
          {
            name: 'completion_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            comment: 'Overall completion percentage'
          },
          {
            name: 'workout_completion_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            comment: 'Workout completion percentage'
          },
          {
            name: 'meal_completion_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            comment: 'Meal plan adherence percentage'
          },
          {
            name: 'weight_change_kg',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: 'Calculated weight change'
          },
          {
            name: 'consistency_score',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: 'Consistency score based on daily logging'
          },
          {
            name: 'engagement_score',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
            comment: 'Engagement score based on detailed tracking'
          },
          {
            name: 'improvement_trend',
            type: 'enum',
            enum: ['declining', 'stable', 'improving', 'excellent'],
            isNullable: true
          },
          {
            name: 'calculated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          }
        ],
        foreignKeys: [
          {
            columnNames: ['accepted_plan_id'],
            referencedTableName: 'accepted_plans',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }
        ]
      }),
      true,
    );

    // Create user_preferences table to store learned preferences
    await queryRunner.createTable(
      new Table({
        name: 'user_preferences',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isUnique: true
          },
          {
            name: 'preferred_workout_types',
            type: 'json',
            isNullable: true,
            comment: 'Learned workout type preferences with scores'
          },
          {
            name: 'disliked_workout_types',
            type: 'json',
            isNullable: true,
            comment: 'Workout types to avoid'
          },
          {
            name: 'preferred_meal_types',
            type: 'json',
            isNullable: true,
            comment: 'Learned meal preferences with scores'
          },
          {
            name: 'disliked_ingredients',
            type: 'json',
            isNullable: true,
            comment: 'Ingredients to avoid based on feedback'
          },
          {
            name: 'optimal_workout_duration',
            type: 'int',
            isNullable: true,
            comment: 'Learned optimal workout duration in minutes'
          },
          {
            name: 'difficulty_preference',
            type: 'enum',
            enum: ['easy', 'moderate', 'challenging', 'mixed'],
            isNullable: true
          },
          {
            name: 'learning_confidence',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0,
            comment: 'How confident we are in these preferences (0-1)'
          },
          {
            name: 'last_updated',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          }
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_preferences');
    await queryRunner.dropTable('plan_analytics');
    await queryRunner.dropTable('plan_feedback');
  }
}
