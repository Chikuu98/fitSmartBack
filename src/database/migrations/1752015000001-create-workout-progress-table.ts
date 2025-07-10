import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWorkoutProgressTable1752015000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workout_progress');
  }
}
