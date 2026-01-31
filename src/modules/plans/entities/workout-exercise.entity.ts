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
import { WorkoutPlan } from './workout-plan.entity';

@Entity('workout_exercises')
@Index('IDX_workout_exercises_plan_order', ['workoutPlan', 'exercise_order'])
export class WorkoutExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_plan_id' })
  workoutPlan: WorkoutPlan;

  @Column({ comment: 'Order of exercise in the workout' })
  exercise_order: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 100, comment: 'cardio, strength, flexibility, etc.' })
  type: string;

  @Column({ nullable: true })
  duration_minutes: number;

  @Column({ nullable: true })
  sets: number;

  @Column({ length: 50, nullable: true, comment: 'Can be number or range like "10-15"' })
  reps: string;

  @Column({ length: 50, nullable: true, comment: 'Weight specification' })
  weight: string;

  @Column('json', { comment: 'Array of target muscle groups' })
  muscle_groups: string[];

  @Column({ nullable: true })
  calories_burned_estimate: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany('WorkoutProgress', 'workoutExercise')
  progress: any[];
}
