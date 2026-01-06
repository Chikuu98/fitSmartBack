import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportAnalyticsTable20250725132200 implements MigrationInterface {
  name = 'CreateReportAnalyticsTable1752023000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE report_analytics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        reports_made INT DEFAULT 0 COMMENT 'Number of reports made by this user',
        reports_received INT DEFAULT 0 COMMENT 'Number of reports received against this user',
        valid_reports_made INT DEFAULT 0 COMMENT 'Number of valid reports made by this user',
        false_reports_made INT DEFAULT 0 COMMENT 'Number of false reports made by this user',
        punishments_received INT DEFAULT 0 COMMENT 'Number of times this user was punished',
        trust_score DECIMAL(5,2) DEFAULT 0 COMMENT 'Trust score based on reporting accuracy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY UK_report_analytics_user (user_id)
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX IDX_analytics_user ON report_analytics(user_id)`);
    await queryRunner.query(`CREATE INDEX IDX_analytics_date ON report_analytics(created_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE report_analytics`);
  }
}
