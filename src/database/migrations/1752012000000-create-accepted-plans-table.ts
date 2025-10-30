import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAcceptedPlansTable1752012000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'accepted_plans',
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
            name: 'generated_plan_id',
            type: 'int',
            isUnique: true
          },
          {
            name: 'previous_plan_id',
            type: 'int',
            isNullable: true,
            comment: 'Reference to previous accepted plan for progression tracking'
          },
          {
            name: 'plan_name',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: 'User-defined name for the plan'
          },
          {
            name: 'start_date',
            type: 'date'
          },
          {
            name: 'end_date',
            type: 'date'
          },
          {
            name: 'target_goal',
            type: 'varchar',
            length: '200',
            comment: 'Specific goal for this plan period'
          },
          {
            name: 'initial_weight',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true
          },
          {
            name: 'target_weight',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['accepted', 'active', 'completed', 'paused', 'cancelled'],
            default: "'accepted'"
          },
          {
            name: 'completion_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Overall plan completion percentage'
          },
          {
            name: 'accepted_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
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
            columnNames: ['generated_plan_id'],
            referencedTableName: 'generated_plans',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['previous_plan_id'],
            referencedTableName: 'accepted_plans',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }
        ],
        indices: [
          {
            name: 'IDX_accepted_plans_user_status',
            columnNames: ['user_id', 'status']
          },
          {
            name: 'IDX_accepted_plans_dates',
            columnNames: ['start_date', 'end_date']
          }
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('accepted_plans');
  }
}
