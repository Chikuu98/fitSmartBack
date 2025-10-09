import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGeneratedPlansTable1752011000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'generated_plans',
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
            name: 'plan_type_id',
            type: 'int'
          },
          {
            name: 'duration_days',
            type: 'int',
            default: 7,
            comment: 'Plan duration in days'
          },
          {
            name: 'prompt_data',
            type: 'json',
            comment: 'User profile data sent to OpenAI'
          },
          {
            name: 'ai_response',
            type: 'json',
            isNullable: true,
            comment: 'Raw response from Gemini/OpenAI API'
          },
          {
            name: 'generation_model',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'AI model used for generation'
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['generating', 'completed', 'failed'],
            default: "'completed'"
          },
          {
            name: 'error_message',
            type: 'text',
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
            columnNames: ['plan_type_id'],
            referencedTableName: 'plan_types',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }
        ],
        indices: [
          {
            name: 'IDX_generated_plans_user_created',
            columnNames: ['user_id', 'created_at']
          },
          {
            name: 'IDX_generated_plans_status',
            columnNames: ['status']
          }
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('generated_plans');
  }
}
