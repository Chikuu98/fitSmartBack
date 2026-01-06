import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AcceptedPlan } from './accepted-plan.entity';

@Entity('plan_pause_periods')
@Index('IDX_pause_periods_plan', ['acceptedPlan'])
@Index('IDX_pause_periods_dates', ['pause_start_date', 'pause_end_date'])
export class PlanPausePeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AcceptedPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accepted_plan_id' })
  acceptedPlan: AcceptedPlan;

  @Column('date', { comment: 'Date when the plan was paused' })
  pause_start_date: Date;

  @Column('date', { nullable: true, comment: 'Date when the plan was resumed (null if currently paused)' })
  pause_end_date: Date;

  @Column({ comment: 'Number of days in this pause period' })
  duration_days: number;

  @CreateDateColumn()
  created_at: Date;
}
