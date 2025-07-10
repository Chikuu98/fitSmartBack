import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDailyProgressTable1752015000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create daily_progress table (main progress tracking)
    await queryRunner.createTable(
      new Table({
        name: 'daily_progress',
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
            name: 'progress_date',
            type: 'date'
          },
          {
            name: 'day_number',
            type: 'int',
            comment: 'Which day of the plan (1-7 for weekly)'
          },
          {
            name: 'current_weight',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true
          },
          {
            name: 'energy_level',
            type: 'enum',
            enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
            isNullable: true
          },
          {
            name: 'mood',
            type: 'enum',
            enum: ['very_poor', 'poor', 'neutral', 'good', 'excellent'],
            isNullable: true
          },
          {
            name: 'sleep_hours',
            type: 'decimal',
            precision: 3,
            scale: 1,
            isNullable: true
          },
          {
            name: 'sleep_quality',
            type: 'enum',
            enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
            isNullable: true
          },
          {
            name: 'water_intake_liters',
            type: 'decimal',
            precision: 3,
            scale: 1,
            isNullable: true
          },
          {
            name: 'stress_level',
            type: 'enum',
            enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
            isNullable: true
          },
          {
            name: 'overall_satisfaction',
            type: 'int',
            isNullable: true,
            comment: 'Rating 1-10 for day satisfaction'
          },
          {
            name: 'created_at',
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
            name: 'IDX_daily_progress_user_date',
            columnNames: ['user_id', 'progress_date'],
            isUnique: true
          },
          {
            name: 'IDX_daily_progress_plan_day',
            columnNames: ['accepted_plan_id', 'day_number']
          }
        ]
      }),
      true,
    );

    // Create workout_progress table (detailed workout tracking)
    await queryRunner.createTable(
      new Table({
        name: 'workout_progress',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'daily_progress_id',
            type: 'int'
          },
          {
            name: 'workout_exercise_id',
            type: 'int'
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['not_started', 'in_progress', 'completed', 'skipped'],
            default: "'not_started'"
          },
          {
            name: 'actual_duration_minutes',
            type: 'int',
            isNullable: true
          },
          {
            name: 'actual_sets',
            type: 'int',
            isNullable: true
          },
          {
            name: 'actual_reps',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Actual reps performed per set'
          },
          {
            name: 'actual_weight',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'difficulty_rating',
            type: 'int',
            isNullable: true,
            comment: 'User rating 1-10 for exercise difficulty'
          },
          {
            name: 'enjoyment_rating',
            type: 'int',
            isNullable: true,
            comment: 'User rating 1-10 for exercise enjoyment'
          },
          {
            name: 'calories_burned',
            type: 'int',
            isNullable: true
          },
          {
            name: 'heart_rate_avg',
            type: 'int',
            isNullable: true
          },
          {
            name: 'heart_rate_max',
            type: 'int',
            isNullable: true
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true
          },
          {
            name: 'started_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'completed_at',
            type: 'timestamp',
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
            columnNames: ['daily_progress_id'],
            referencedTableName: 'daily_progress',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['workout_exercise_id'],
            referencedTableName: 'workout_exercises',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }
        ],
        indices: [
          {
            name: 'IDX_workout_progress_daily_exercise',
            columnNames: ['daily_progress_id', 'workout_exercise_id'],
            isUnique: true
          }
        ]
      }),
      true,
    );

    // Create meal_progress table (detailed meal tracking)
    await queryRunner.createTable(
      new Table({
        name: 'meal_progress',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'daily_progress_id',
            type: 'int'
          },
          {
            name: 'meal_item_id',
            type: 'int'
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['not_consumed', 'partially_consumed', 'fully_consumed', 'skipped'],
            default: "'not_consumed'"
          },
          {
            name: 'portion_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 100,
            comment: 'Percentage of planned portion consumed'
          },
          {
            name: 'actual_calories',
            type: 'int',
            isNullable: true,
            comment: 'Calculated based on portion_percentage'
          },
          {
            name: 'satisfaction_rating',
            type: 'int',
            isNullable: true,
            comment: 'User rating 1-10 for meal satisfaction'
          },
          {
            name: 'taste_rating',
            type: 'int',
            isNullable: true,
            comment: 'User rating 1-10 for taste'
          },
          {
            name: 'hunger_before',
            type: 'enum',
            enum: ['not_hungry', 'slightly_hungry', 'moderately_hungry', 'very_hungry', 'extremely_hungry'],
            isNullable: true
          },
          {
            name: 'hunger_after',
            type: 'enum',
            enum: ['still_hungry', 'satisfied', 'comfortably_full', 'too_full', 'uncomfortably_full'],
            isNullable: true
          },
          {
            name: 'substitutions',
            type: 'json',
            isNullable: true,
            comment: 'Any ingredient substitutions made'
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true
          },
          {
            name: 'consumed_at',
            type: 'timestamp',
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
            columnNames: ['daily_progress_id'],
            referencedTableName: 'daily_progress',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['meal_item_id'],
            referencedTableName: 'meal_items',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }
        ],
        indices: [
          {
            name: 'IDX_meal_progress_daily_meal',
            columnNames: ['daily_progress_id', 'meal_item_id'],
            isUnique: true
          }
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('meal_progress');
    await queryRunner.dropTable('workout_progress');
    await queryRunner.dropTable('daily_progress');
  }
}
