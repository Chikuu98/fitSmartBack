import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateBookingsTable1750661356745 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'member_id',
            type: 'int',
          },
          {
            name: 'mentor_slot_id',
            type: 'int',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
            default: `'pending'`,
          },
          {
            name: 'payment_status',
            type: 'enum',
            enum: ['unpaid', 'paid', 'refunded'],
            default: `'unpaid'`,
          },
          {
            name: 'google_meet_link',
            type: 'varchar',
            length: '500',
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
      })
    );

    await queryRunner.createForeignKeys('bookings', [
      new TableForeignKey({
        columnNames: ['member_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['mentor_slot_id'],
        referencedTableName: 'mentor_time_slots',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bookings');
  }

}
