import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePlanPausePeriodsTable20260106182640 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'plan_pause_periods',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'accepted_plan_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'pause_start_date',
            type: 'date',
            isNullable: false,
            comment: 'Date when the plan was paused',
          },
          {
            name: 'pause_end_date',
            type: 'date',
            isNullable: true,
            comment: 'Date when the plan was resumed (null if currently paused)',
          },
          {
            name: 'duration_days',
            type: 'int',
            isNullable: false,
            default: 0,
            comment: 'Number of days in this pause period',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'plan_pause_periods',
      new TableForeignKey({
        columnNames: ['accepted_plan_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accepted_plans',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'plan_pause_periods',
      new TableIndex({
        name: 'IDX_pause_periods_plan',
        columnNames: ['accepted_plan_id'],
      }),
    );

    await queryRunner.createIndex(
      'plan_pause_periods',
      new TableIndex({
        name: 'IDX_pause_periods_dates',
        columnNames: ['pause_start_date', 'pause_end_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('plan_pause_periods', 'IDX_pause_periods_dates');
    await queryRunner.dropIndex('plan_pause_periods', 'IDX_pause_periods_plan');

    const table = await queryRunner.getTable('plan_pause_periods');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('accepted_plan_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('plan_pause_periods', foreignKey);
      }
    }

    await queryRunner.dropTable('plan_pause_periods');
  }
}
