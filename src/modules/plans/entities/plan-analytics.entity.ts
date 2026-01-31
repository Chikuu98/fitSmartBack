import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export enum ImprovementTrend {
  DECLINING = 'declining',
  STABLE = 'stable',
  IMPROVING = 'improving',
  EXCELLENT = 'excellent',
}

@Entity('plan_analytics')
export class PlanAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne('AcceptedPlan', 'analytics', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accepted_plan_id' })
  acceptedPlan: any;

  @Column('decimal', { precision: 5, scale: 2, comment: 'Overall completion percentage' })
  completion_rate: number;

  @Column('decimal', { precision: 5, scale: 2, comment: 'Workout completion percentage' })
  workout_completion_rate: number;

  @Column('decimal', { precision: 5, scale: 2, comment: 'Meal plan adherence percentage' })
  meal_completion_rate: number;

  @Column('decimal', { precision: 4, scale: 2, nullable: true, comment: 'Calculated weight change' })
  weight_change_kg: number;

  @Column('decimal', { precision: 4, scale: 2, nullable: true, comment: 'Consistency score based on daily logging' })
  consistency_score: number;

  @Column('decimal', { precision: 4, scale: 2, nullable: true, comment: 'Engagement score based on detailed tracking' })
  engagement_score: number;

  @Column({ type: 'enum', enum: ImprovementTrend, nullable: true })
  improvement_trend: ImprovementTrend;

  @CreateDateColumn()
  calculated_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
