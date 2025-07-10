import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserPreferencesTable1752016000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_preferences',
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
            type: 'int',
            isUnique: true
          },
          {
            name: 'preferred_workout_types',
            type: 'json',
            isNullable: true,
            comment: 'Learned workout type preferences with scores'
          },
          {
            name: 'disliked_workout_types',
            type: 'json',
            isNullable: true,
            comment: 'Workout types to avoid'
          },
          {
            name: 'preferred_meal_types',
            type: 'json',
            isNullable: true,
            comment: 'Learned meal preferences with scores'
          },
          {
            name: 'disliked_ingredients',
            type: 'json',
            isNullable: true,
            comment: 'Ingredients to avoid based on feedback'
          },
          {
            name: 'optimal_workout_duration',
            type: 'int',
            isNullable: true,
            comment: 'Learned optimal workout duration in minutes'
          },
          {
            name: 'difficulty_preference',
            type: 'enum',
            enum: ['easy', 'moderate', 'challenging', 'mixed'],
            isNullable: true
          },
          {
            name: 'learning_confidence',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0,
            comment: 'How confident we are in these preferences (0-1)'
          },
          {
            name: 'last_updated',
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
          }
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_preferences');
  }
}
