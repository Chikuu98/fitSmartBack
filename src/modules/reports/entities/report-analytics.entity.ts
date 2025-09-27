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

@Entity('report_analytics')
@Index('IDX_analytics_user', ['user'])
@Index('IDX_analytics_date', ['created_at'])
export class ReportAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', default: 0, comment: 'Number of reports made by this user' })
  reports_made: number;

  @Column({ type: 'int', default: 0, comment: 'Number of reports received against this user' })
  reports_received: number;

  @Column({ type: 'int', default: 0, comment: 'Number of valid reports made by this user' })
  valid_reports_made: number;

  @Column({ type: 'int', default: 0, comment: 'Number of false reports made by this user' })
  false_reports_made: number;

  @Column({ type: 'int', default: 0, comment: 'Number of times this user was punished' })
  punishments_received: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: 'Trust score based on reporting accuracy' })
  trust_score: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
