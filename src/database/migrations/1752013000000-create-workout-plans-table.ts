import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWorkoutPlansTable1752013000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workout_plans',
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
            type: 'int'
          },
          {
            name: 'day_number',
            type: 'int',
            comment: '1-7 for weekly plans, can extend for custom durations'
          },
          {
            name: 'day_name',
            type: 'varchar',
            length: '20',
            comment: 'Monday, Tuesday, etc.'
          },
          {
            name: 'total_duration_minutes',
            type: 'int',
            comment: 'Total workout duration for the day'
          },
          {
            name: 'difficulty_level',
            type: 'enum',
            enum: ['easy', 'moderate', 'hard', 'extreme'],
            default: "'moderate'"
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Daily workout notes or instructions'
          },
          {
            name: 'created_at',
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
        ],
        indices: [
          {
            name: 'IDX_workout_plans_plan_day',
            columnNames: ['accepted_plan_id', 'day_number']
          }
        ]
      }),
      true,
    );

    // Create workout_exercises table
    await queryRunner.createTable(
      new Table({
        name: 'workout_exercises',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'workout_plan_id',
            type: 'int'
          },
          {
            name: 'exercise_order',
            type: 'int',
            comment: 'Order of exercise in the workout'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200'
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
            comment: 'cardio, strength, flexibility, etc.'
          },
          {
            name: 'duration_minutes',
            type: 'int',
            isNullable: true
          },
          {
            name: 'sets',
            type: 'int',
            isNullable: true
          },
          {
            name: 'reps',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Can be number or range like "10-15"'
          },
          {
            name: 'weight',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Weight specification'
          },
          {
            name: 'muscle_groups',
            type: 'json',
            comment: 'Array of target muscle groups'
          },
          {
            name: 'calories_burned_estimate',
            type: 'int',
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
            columnNames: ['workout_plan_id'],
            referencedTableName: 'workout_plans',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }
        ],
        indices: [
          {
            name: 'IDX_workout_exercises_plan_order',
            columnNames: ['workout_plan_id', 'exercise_order']
          }
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workout_exercises');
    await queryRunner.dropTable('workout_plans');
  }
}
