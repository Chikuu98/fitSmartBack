import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/core/users/user.entity';

export enum DifficultyPreference {
  EASY = 'easy',
  MODERATE = 'moderate',
  CHALLENGING = 'challenging',
  MIXED = 'mixed',
}

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('json', { nullable: true, comment: 'Learned workout type preferences with scores' })
  preferred_workout_types: object[];

  @Column('json', { nullable: true, comment: 'Workout types to avoid' })
  disliked_workout_types: string[];

  @Column('json', { nullable: true, comment: 'Learned meal preferences with scores' })
  preferred_meal_types: object[];

  @Column('json', { nullable: true, comment: 'Ingredients to avoid based on feedback' })
  disliked_ingredients: string[];

  @Column({ nullable: true, comment: 'Learned optimal workout duration in minutes' })
  optimal_workout_duration: number;

  @Column({ type: 'enum', enum: DifficultyPreference, nullable: true })
  difficulty_preference: DifficultyPreference;

  @Column('decimal', { precision: 3, scale: 2, default: 0, comment: 'How confident we are in these preferences (0-1)' })
  learning_confidence: number;

  @CreateDateColumn()
  last_updated: Date;
}
