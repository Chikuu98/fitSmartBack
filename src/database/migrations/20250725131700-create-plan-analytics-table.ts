import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePlanAnalyticsTable20250725131700 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('plan_analytics');
  }
}
