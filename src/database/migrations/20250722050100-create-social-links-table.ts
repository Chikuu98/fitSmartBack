import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSocialLinksTable20250722050100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'social_links',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'platform', type: 'varchar', length: '255' },
          { name: 'url', type: 'varchar', length: '500' },
          { name: 'mentor_detail_id', type: 'int' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'social_links',
      new TableForeignKey({
        columnNames: ['mentor_detail_id'],
        referencedTableName: 'mentor_details',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('social_links', 'mentor_detail_id');
    await queryRunner.dropTable('social_links');
  }
}
