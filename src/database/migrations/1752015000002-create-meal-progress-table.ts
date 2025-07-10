import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMealProgressTable1752015000002 implements MigrationInterface {
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
  }
}
