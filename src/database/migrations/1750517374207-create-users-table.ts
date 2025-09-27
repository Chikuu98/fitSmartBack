import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1750517374207 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'email', type: 'varchar', length: '100', isUnique: true },
          { name: 'password', type: 'varchar', length: '255' },
          { name: 'gender', type: 'enum', enum: ['male', 'female', 'other'] },
          {
            name: 'role',
            type: 'enum',
            enum: ['member', 'mentor', 'admin'],
            default: "'member'",
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'language',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'suspended', 'banned', 'pending_review'],
            default: "'active'",
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
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
