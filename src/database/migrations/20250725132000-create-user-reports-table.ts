import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserReportsTable20250725132000 implements MigrationInterface {
  name = 'CreateUserReportsTable1752021000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user_reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        reporter_id INT NOT NULL,
        reported_user_id INT NOT NULL,
        report_type ENUM('forum_thread', 'forum_reply', 'user_profile', 'spam', 'harassment', 'inappropriate_content', 'fake_account', 'other') NOT NULL COMMENT 'Type of report',
        reported_content_type ENUM('forum_thread', 'forum_reply', 'user_profile') NOT NULL COMMENT 'Type of content being reported',
        reported_content_id INT NOT NULL COMMENT 'ID of the content being reported (thread_id, reply_id, etc.)',
        reason TEXT NOT NULL COMMENT 'Detailed reason for the report',
        evidence TEXT NULL COMMENT 'Additional evidence or context',
        status ENUM('pending', 'under_review', 'resolved', 'dismissed') DEFAULT 'pending',
        reviewed_by_id INT NULL,
        review_notes TEXT NULL COMMENT 'Admin notes about the review',
        reviewed_at TIMESTAMP NULL COMMENT 'When the report was reviewed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX IDX_reports_status ON user_reports(status)`);
    await queryRunner.query(`CREATE INDEX IDX_reports_type ON user_reports(report_type)`);
    await queryRunner.query(`CREATE INDEX IDX_reports_content ON user_reports(reported_content_type, reported_content_id)`);
    await queryRunner.query(`CREATE INDEX IDX_reports_reported_user ON user_reports(reported_user_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_reports`);
  }
}
