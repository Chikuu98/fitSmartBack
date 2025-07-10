import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCertificationsTable1752001000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'certifications',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'issuer', type: 'varchar', length: '255' },
          { name: 'issue_date', type: 'date', isNullable: true },
          { name: 'mentor_detail_id', type: 'int' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'certifications',
      new TableForeignKey({
        columnNames: ['mentor_detail_id'],
        referencedTableName: 'mentor_details',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('certifications', 'mentor_detail_id');
    await queryRunner.dropTable('certifications');
  }
}
