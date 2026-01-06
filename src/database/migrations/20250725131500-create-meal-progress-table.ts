import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMealProgressTable20250725131500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'General notes about the meal consumption'
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
  }
}
