import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DailyProgress } from './daily-progress.entity';
import { WorkoutExercise } from './workout-exercise.entity';

export enum WorkoutStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

@Entity('workout_progress')
@Index('IDX_workout_progress_daily_exercise', ['dailyProgress', 'workoutExercise'], { unique: true })
export class WorkoutProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DailyProgress, (progress) => progress.workoutProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_progress_id' })
  dailyProgress: DailyProgress;

  @ManyToOne(() => WorkoutExercise, (exercise) => exercise.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_exercise_id' })
  workoutExercise: WorkoutExercise;

  @Column({ type: 'enum', enum: WorkoutStatus, default: WorkoutStatus.NOT_STARTED })
  status: WorkoutStatus;

  @Column({ nullable: true })
  actual_duration_minutes: number;

  @Column({ nullable: true })
  actual_sets: number;

  @Column({ length: 100, nullable: true, comment: 'Actual reps performed per set' })
  actual_reps: string;

  @Column({ length: 50, nullable: true })
  actual_weight: string;

  @Column({ nullable: true, comment: 'User rating 1-10 for exercise difficulty' })
  difficulty_rating: number;

  @Column({ nullable: true, comment: 'User rating 1-10 for exercise enjoyment' })
  enjoyment_rating: number;

  @Column({ nullable: true })
  calories_burned: number;

  @Column({ nullable: true })
  heart_rate_avg: number;

  @Column({ nullable: true })
  heart_rate_max: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  started_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
