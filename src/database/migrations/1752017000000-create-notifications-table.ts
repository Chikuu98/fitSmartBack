import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1752017000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
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
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
            comment: 'Type of notification'
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            comment: 'Notification title'
          },
          {
            name: 'message',
            type: 'text',
            comment: 'Notification content'
          },
          {
            name: 'data',
            type: 'json',
            isNullable: true,
            comment: 'Additional data related to notification'
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
            comment: 'Whether notification has been read'
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When notification was read'
          },
          {
            name: 'action_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'URL to navigate when notification is clicked'
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When notification expires'
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_notifications_user_read',
            columnNames: ['user_id', 'is_read'],
          },
          {
            name: 'IDX_notifications_type',
            columnNames: ['type'],
          },
          {
            name: 'IDX_notifications_created',
            columnNames: ['created_at'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
