import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMealPlansTable1752014000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create meal_plans table
    await queryRunner.createTable(
      new Table({
        name: 'meal_plans',
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
            name: 'total_calories',
            type: 'int',
            comment: 'Total daily calories'
          },
          {
            name: 'total_protein',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: 'Total protein in grams'
          },
          {
            name: 'total_carbs',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: 'Total carbohydrates in grams'
          },
          {
            name: 'total_fats',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: 'Total fats in grams'
          },
          {
            name: 'total_fiber',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: 'Total fiber in grams'
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Daily meal plan notes'
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
            name: 'IDX_meal_plans_plan_day',
            columnNames: ['accepted_plan_id', 'day_number']
          }
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('meal_plans');
  }
}
