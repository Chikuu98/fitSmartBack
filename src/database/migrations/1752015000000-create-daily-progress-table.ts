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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('daily_progress');
  }
}
