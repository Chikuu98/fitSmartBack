import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateForumThreadTagsTable20250725130005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'forum_thread_tags',
        columns: [
          {
            name: 'thread_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'tag_id',
            type: 'int',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['thread_id'],
            referencedTableName: 'forum_threads',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['tag_id'],
            referencedTableName: 'forum_tags',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('forum_thread_tags');
  }
}
