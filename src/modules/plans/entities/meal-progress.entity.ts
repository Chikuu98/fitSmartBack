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

  @Column('decimal', { precision: 5, scale: 2, default: 100, comment: 'Percentage of planned portion consumed' })
  portion_percentage: number;

  @Column({ nullable: true, comment: 'Calculated based on portion_percentage' })
  actual_calories: number;

  @Column({ nullable: true, comment: 'User rating 1-10 for meal satisfaction' })
  satisfaction_rating: number;

  @Column({ nullable: true, comment: 'User rating 1-10 for taste' })
  taste_rating: number;

  @Column({ type: 'enum', enum: HungerLevel, nullable: true })
  hunger_before: HungerLevel;

  @Column({ type: 'enum', enum: FullnessLevel, nullable: true })
  hunger_after: FullnessLevel;

  @Column('json', { nullable: true, comment: 'Any ingredient substitutions made' })
  substitutions: object[];

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  consumed_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
