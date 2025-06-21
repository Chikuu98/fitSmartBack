import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1750517374207 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'email', type: 'varchar', length: '100', isUnique: true },
          { name: 'password', type: 'varchar', length: '255' },
          { name: 'gender', type: 'enum', enum: ['male', 'female', 'other'] },
          { name: 'age', type: 'int' },
          { name: 'height', type: 'decimal', precision: 5, scale: 2 },
          { name: 'weight', type: 'decimal', precision: 5, scale: 2 },
          { name: 'fitness_level', type: 'enum', enum: ['beginner', 'intermediate', 'advanced'] },
          { name: 'goal', type: 'varchar', length: '100' },
          { name: 'dietary_preference', type: 'varchar', length: '100' },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
