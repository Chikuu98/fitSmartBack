import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMealItemsTable20250725131200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'meal_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'meal_plan_id',
            type: 'int'
          },
          {
            name: 'meal_type',
            type: 'enum',
            enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'],
            comment: 'Type of meal'
          },
          {
            name: 'meal_order',
            type: 'int',
            comment: 'Order within the meal type (for multiple snacks, etc.)'
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200'
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'ingredients',
            type: 'json',
            comment: 'Array of ingredients with quantities'
          },
          {
            name: 'calories',
            type: 'int'
          },
          {
            name: 'protein',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: 'Protein in grams'
          },
          {
            name: 'carbs',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: 'Carbohydrates in grams'
          },
          {
            name: 'fats',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: 'Fats in grams'
          },
          {
            name: 'fiber',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: 'Fiber in grams'
          },
          {
            name: 'sugar',
            type: 'decimal',
            precision: 6,
            scale: 2,
            isNullable: true,
            comment: 'Sugar in grams'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          }
        ],
        foreignKeys: [
          {
            columnNames: ['meal_plan_id'],
            referencedTableName: 'meal_plans',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }
        ],
        indices: [
          {
            name: 'IDX_meal_items_plan_type_order',
            columnNames: ['meal_plan_id', 'meal_type', 'meal_order']
          }
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('meal_items');
  }
}
