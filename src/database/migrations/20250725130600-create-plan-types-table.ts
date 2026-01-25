import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePlanTypesTable20250725130600 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'plan_types',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isUnique: true
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          }
        ],
      }),
      true,
    );

    await queryRunner.query(`
      INSERT INTO plan_types (name, description) VALUES 
      ('workout', 'Physical exercise and fitness plans'),
      ('meal', 'Nutrition and diet plans'),
      ('combined', 'Combined workout and meal plans')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('plan_types');
  }
}
