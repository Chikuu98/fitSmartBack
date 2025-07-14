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
import { MealItem } from './meal-item.entity';

export enum MealStatus {
  NOT_CONSUMED = 'not_consumed',
  PARTIALLY_CONSUMED = 'partially_consumed',
  FULLY_CONSUMED = 'fully_consumed',
  SKIPPED = 'skipped',
}

export enum HungerLevel {
  NOT_HUNGRY = 'not_hungry',
  SLIGHTLY_HUNGRY = 'slightly_hungry',
  MODERATELY_HUNGRY = 'moderately_hungry',
  VERY_HUNGRY = 'very_hungry',
  EXTREMELY_HUNGRY = 'extremely_hungry',
}

export enum FullnessLevel {
  STILL_HUNGRY = 'still_hungry',
  SATISFIED = 'satisfied',
  COMFORTABLY_FULL = 'comfortably_full',
  TOO_FULL = 'too_full',
  UNCOMFORTABLY_FULL = 'uncomfortably_full',
}

@Entity('meal_progress')
@Index('IDX_meal_progress_daily_meal', ['dailyProgress', 'mealItem'], { unique: true })
export class MealProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DailyProgress, (progress) => progress.mealProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_progress_id' })
  dailyProgress: DailyProgress;

  @ManyToOne(() => MealItem, (item) => item.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_item_id' })
  mealItem: MealItem;

  @Column({ type: 'enum', enum: MealStatus, default: MealStatus.NOT_CONSUMED })
  status: MealStatus;

  @Column('text', { nullable: true, comment: 'General notes about the meal consumption' })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
