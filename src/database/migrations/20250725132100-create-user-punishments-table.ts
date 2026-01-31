import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPunishmentsTable20250725132100 implements MigrationInterface {
  name = 'CreateUserPunishmentsTable1752022000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user_punishments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        punishment_type ENUM('warning', 'temporary_suspension', 'permanent_ban', 'forum_restriction', 'content_removal') NOT NULL,
        reason TEXT NOT NULL COMMENT 'Reason for the punishment',
        admin_notes TEXT NULL COMMENT 'Additional notes from admin',
        issued_by_id INT NOT NULL,
        related_report_id INT NULL,
        expires_at TIMESTAMP NULL COMMENT 'When the punishment expires (null for permanent)',
        is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this punishment is currently active',
        ended_at TIMESTAMP NULL COMMENT 'When the punishment was lifted or expired',
        lifted_by_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (issued_by_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (lifted_by_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (related_report_id) REFERENCES user_reports(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_punishment_user ON user_punishments(user_id)`);
    await queryRunner.query(`CREATE INDEX IDX_punishment_status ON user_punishments(is_active)`);
    await queryRunner.query(`CREATE INDEX IDX_punishment_expires ON user_punishments(expires_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_punishments`);
  }
}
