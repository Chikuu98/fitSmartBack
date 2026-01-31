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

  @Column({ length: 50, nullable: true, comment: 'Weight used for strength exercises' })
  actual_weight: string;

  @Column('text', { nullable: true, comment: 'General notes about the exercise performance' })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
