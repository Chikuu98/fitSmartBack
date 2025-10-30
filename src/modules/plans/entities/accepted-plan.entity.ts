import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '@/core/users/user.entity';
import { GeneratedPlan } from './generated-plan.entity';

export enum AcceptedPlanStatus {
  ACCEPTED = 'accepted',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

@Entity('accepted_plans')
@Index('IDX_accepted_plans_user_status', ['user', 'status'])
@Index('IDX_accepted_plans_dates', ['start_date', 'end_date'])
export class AcceptedPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => GeneratedPlan, (generatedPlan) => generatedPlan.acceptedPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'generated_plan_id' })
  generatedPlan: GeneratedPlan;

  @ManyToOne(() => AcceptedPlan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'previous_plan_id' })
  previousPlan: AcceptedPlan;

  @Column({ length: 200, nullable: true, comment: 'User-defined name for the plan' })
  plan_name: string;

  @Column('date')
  start_date: Date;

  @Column('date')
  end_date: Date;

  @Column({ length: 200, comment: 'Specific goal for this plan period' })
  target_goal: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  initial_weight: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  target_weight: number;

  @Column({ type: 'enum', enum: AcceptedPlanStatus, default: AcceptedPlanStatus.ACCEPTED })
  status: AcceptedPlanStatus;

  @Column('decimal', { precision: 5, scale: 2, default: 0, comment: 'Overall plan completion percentage' })
  completion_percentage: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  accepted_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany('WorkoutPlan', 'acceptedPlan')
  workoutPlans: any[];

  @OneToMany('MealPlan', 'acceptedPlan')
  mealPlans: any[];

  @OneToMany('DailyProgress', 'acceptedPlan')
  dailyProgress: any[];

  @OneToOne('PlanFeedback', 'acceptedPlan')
  feedback: any;

  @OneToOne('PlanAnalytics', 'acceptedPlan')
  analytics: any;

  @OneToMany('AcceptedPlan', 'previousPlan')
  subsequentPlans: AcceptedPlan[];
}
