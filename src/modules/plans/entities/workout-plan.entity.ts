import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { AcceptedPlan } from './accepted-plan.entity';

export enum DifficultyLevel {
  EASY = 'easy',
  MODERATE = 'moderate',
  HARD = 'hard',
  EXTREME = 'extreme',
}

@Entity('workout_plans')
@Index('IDX_workout_plans_plan_day', ['acceptedPlan', 'day_number'])
export class WorkoutPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AcceptedPlan, (plan) => plan.workoutPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accepted_plan_id' })
  acceptedPlan: AcceptedPlan;

  @Column({ comment: '1-7 for weekly plans, can extend for custom durations' })
  day_number: number;

  @Column({ length: 100, comment: 'Day name or description (e.g., "Day 1: Full Body Strength")' })
  day_name: string;

  @Column({ comment: 'Total workout duration for the day' })
  total_duration_minutes: number;

  @Column({ type: 'enum', enum: DifficultyLevel, default: DifficultyLevel.MODERATE })
  difficulty_level: DifficultyLevel;

  @Column('text', { nullable: true, comment: 'Daily workout notes or instructions' })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany('WorkoutExercise', 'workoutPlan')
  exercises: any[];
}
