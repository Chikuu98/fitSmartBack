import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPauseTrackingToAcceptedPlans20250725132300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'accepted_plans',
      new TableColumn({
        name: 'paused_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'Timestamp when the plan was last paused',
      }),
    );

    await queryRunner.addColumn(
      'accepted_plans',
      new TableColumn({
        name: 'resumed_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'Timestamp when the plan was last resumed',
      }),
    );

    await queryRunner.addColumn(
      'accepted_plans',
      new TableColumn({
        name: 'total_paused_days',
        type: 'int',
        default: 0,
        isNullable: false,
        comment: 'Total number of days the plan has been paused (cumulative)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('accepted_plans', 'total_paused_days');
    await queryRunner.dropColumn('accepted_plans', 'resumed_at');
    await queryRunner.dropColumn('accepted_plans', 'paused_at');
  }
}
