import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '@/core/users/user.entity';
import { AcceptedPlan } from './accepted-plan.entity';

export enum EnergyLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum Mood {
  VERY_POOR = 'very_poor',
  POOR = 'poor',
  NEUTRAL = 'neutral',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

export enum SleepQuality {
  VERY_POOR = 'very_poor',
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

export enum StressLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

@Entity('daily_progress')
@Index('IDX_daily_progress_user_date', ['user', 'progress_date'], { unique: true })
@Index('IDX_daily_progress_plan_day', ['acceptedPlan', 'day_number'])
export class DailyProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AcceptedPlan, (plan) => plan.dailyProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accepted_plan_id' })
  acceptedPlan: AcceptedPlan;

  @Column('date')
  progress_date: Date;

  @Column({ comment: 'Which day of the plan (1-7 for weekly)' })
  day_number: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  current_weight: number;

  @Column({ type: 'enum', enum: EnergyLevel, nullable: true })
  energy_level: EnergyLevel;

  @Column({ type: 'enum', enum: Mood, nullable: true })
  mood: Mood;

  @Column('decimal', { precision: 3, scale: 1, nullable: true })
  sleep_hours: number;

  @Column({ type: 'enum', enum: SleepQuality, nullable: true })
  sleep_quality: SleepQuality;

  @Column('decimal', { precision: 3, scale: 1, nullable: true })
  water_intake_liters: number;

  @Column({ type: 'enum', enum: StressLevel, nullable: true })
  stress_level: StressLevel;

  @Column({ nullable: true, comment: 'Rating 1-10 for day satisfaction' })
  overall_satisfaction: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany('WorkoutProgress', 'dailyProgress')
  workoutProgress: any[];

  @OneToMany('MealProgress', 'dailyProgress')
  mealProgress: any[];
}
