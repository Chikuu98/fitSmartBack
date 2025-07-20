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
import { User } from '../../core/users/user.entity';

export enum NotificationType {
  PLAN_GENERATED = 'plan_generated',
  PLAN_REMINDER = 'plan_reminder',
  WORKOUT_REMINDER = 'workout_reminder',
  MEAL_REMINDER = 'meal_reminder',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  MENTOR_MESSAGE = 'mentor_message',
  FORUM_REPLY = 'forum_reply',
  FORUM_LIKE = 'forum_like',
  SYSTEM_UPDATE = 'system_update',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
}

@Entity('notifications')
@Index('IDX_notifications_user_read', ['user', 'is_read'])
@Index('IDX_notifications_type', ['type'])
@Index('IDX_notifications_created', ['created_at'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100, comment: 'Type of notification' })
  type: string;

  @Column({ length: 255, comment: 'Notification title' })
  title: string;

  @Column({ type: 'text', comment: 'Notification content' })
  message: string;

  @Column('json', { nullable: true, comment: 'Additional data related to notification' })
  data: Record<string, any>;

  @Column({ default: false, comment: 'Whether notification has been read' })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true, comment: 'When notification was read' })
  read_at: Date;

  @Column({ length: 500, nullable: true, comment: 'URL to navigate when notification is clicked' })
  action_url: string;

  @Column({ type: 'timestamp', nullable: true, comment: 'When notification expires' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
