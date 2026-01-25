import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateRatingsTable20260113000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ratings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'booking_id',
            type: 'int',
            isUnique: true,
          },
          {
            name: 'member_id',
            type: 'int',
          },
          {
            name: 'mentor_id',
            type: 'int',
          },
          {
            name: 'rating',
            type: 'decimal',
            precision: 2,
            scale: 1,
          },
          {
            name: 'review',
            type: 'text',
            isNullable: true,
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
      }),
    );

    await queryRunner.createForeignKeys('ratings', [
      new TableForeignKey({
        columnNames: ['booking_id'],
        referencedTableName: 'bookings',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['member_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['mentor_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.query(
      `CREATE INDEX idx_ratings_mentor_id ON ratings(mentor_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_ratings_member_id ON ratings(member_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('ratings');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('ratings', foreignKey);
      }
    }

    await queryRunner.query(`DROP INDEX idx_ratings_mentor_id ON ratings`);
    await queryRunner.query(`DROP INDEX idx_ratings_member_id ON ratings`);
    await queryRunner.dropTable('ratings');
  }
}
