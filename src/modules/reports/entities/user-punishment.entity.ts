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

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  WARNING = 'warning',
}

export enum PunishmentType {
  WARNING = 'warning',
  TEMPORARY_SUSPENSION = 'temporary_suspension',
  PERMANENT_BAN = 'permanent_ban',
  FORUM_RESTRICTION = 'forum_restriction',
  CONTENT_REMOVAL = 'content_removal',
}

@Entity('user_punishments')
@Index('IDX_punishment_user', ['user'])
@Index('IDX_punishment_status', ['is_active'])
@Index('IDX_punishment_expires', ['expires_at'])
export class UserPunishment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: PunishmentType })
  punishment_type: PunishmentType;

  @Column({ type: 'text', comment: 'Reason for the punishment' })
  reason: string;

  @Column({ type: 'text', nullable: true, comment: 'Additional notes from admin' })
  admin_notes: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'issued_by_id' })
  issued_by: User;

  @Column({ type: 'int', nullable: true })
  related_report_id: number;

  @Column({ type: 'timestamp', nullable: true, comment: 'When the punishment expires (null for permanent)' })
  expires_at: Date;

  @Column({ type: 'boolean', default: true, comment: 'Whether this punishment is currently active' })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true, comment: 'When the punishment was lifted or expired' })
  ended_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'lifted_by_id' })
  lifted_by: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
