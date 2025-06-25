import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMentorTimeSlotsTable1750610272757
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mentor_time_slots',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'mentorId', type: 'int' },
          { name: 'date', type: 'date' },
          { name: 'start_time', type: 'time' },
          { name: 'end_time', type: 'time' },
          { name: 'is_booked', type: 'boolean', default: false },
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
        foreignKeys: [
          {
            columnNames: ['mentorId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('mentor_time_slots');
  }
}
