import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { User } from '@/core/users/user.entity';

export enum GoalAchievement {
  NOT_ACHIEVED = 'not_achieved',
  PARTIALLY_ACHIEVED = 'partially_achieved',
  FULLY_ACHIEVED = 'fully_achieved',
  EXCEEDED = 'exceeded',
}

@Entity('plan_feedback')
@Index('IDX_plan_feedback_user_plan', ['user', 'acceptedPlan'], { unique: true })
export class PlanFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne('AcceptedPlan', 'feedback', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accepted_plan_id' })
  acceptedPlan: any;

  @Column({ comment: 'Overall plan rating 1-10' })
  overall_rating: number;

  @Column({ type: 'enum', enum: GoalAchievement, comment: 'How well the plan helped achieve goals' })
  goal_achievement: GoalAchievement;

  @Column({ default: false })
  would_recommend: boolean;

  @Column('text', { nullable: true })
  additional_comments: string;

  @CreateDateColumn()
  created_at: Date;
}
