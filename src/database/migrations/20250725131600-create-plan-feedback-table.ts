import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePlanFeedbackTable20250725131600 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('plan_feedback');
  }
}
