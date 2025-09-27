import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../core/users/user.entity';

export enum ReportType {
  FORUM_THREAD = 'forum_thread',
  FORUM_REPLY = 'forum_reply',
  USER_PROFILE = 'user_profile',
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  FAKE_ACCOUNT = 'fake_account',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum ReportedContentType {
  FORUM_THREAD = 'forum_thread',
  FORUM_REPLY = 'forum_reply',
  USER_PROFILE = 'user_profile',
}

@Entity('user_reports')
@Index('IDX_reports_status', ['status'])
@Index('IDX_reports_type', ['report_type'])
@Index('IDX_reports_content', ['reported_content_type', 'reported_content_id'])
@Index('IDX_reports_reported_user', ['reported_user'])
export class UserReport {
  @PrimaryGeneratedColumn()
  id: number;

  // User who made the report
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  // User being reported
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reported_user_id' })
  reported_user: User;

  @Column({ type: 'enum', enum: ReportType, comment: 'Type of report' })
  report_type: ReportType;

  @Column({ type: 'enum', enum: ReportedContentType, comment: 'Type of content being reported' })
  reported_content_type: ReportedContentType;

  @Column({ type: 'int', comment: 'ID of the content being reported (thread_id, reply_id, etc.)' })
  reported_content_id: number;

  @Column({ type: 'text', comment: 'Detailed reason for the report' })
  reason: string;

  @Column({ type: 'text', nullable: true, comment: 'Additional evidence or context' })
  evidence: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  // Admin who reviewed the report
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewed_by: User;

  @Column({ type: 'text', nullable: true, comment: 'Admin notes about the review' })
  review_notes: string;

  @Column({ type: 'timestamp', nullable: true, comment: 'When the report was reviewed' })
  reviewed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
