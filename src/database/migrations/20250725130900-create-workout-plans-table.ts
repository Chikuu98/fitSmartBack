import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWorkoutPlansTable20250725130900 implements MigrationInterface {
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
            length: '100',
            comment: 'Day name or description (e.g., "Day 1: Full Body Strength")'
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workout_plans');
  }
}
