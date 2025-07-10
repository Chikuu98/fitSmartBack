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
import { MealPlan } from './meal-plan.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  PRE_WORKOUT = 'pre_workout',
  POST_WORKOUT = 'post_workout',
}

@Entity('meal_items')
@Index('IDX_meal_items_plan_type_order', ['mealPlan', 'meal_type', 'meal_order'])
export class MealItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MealPlan, (plan) => plan.meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_plan_id' })
  mealPlan: MealPlan;

  @Column({ type: 'enum', enum: MealType, comment: 'Type of meal' })
  meal_type: MealType;

  @Column({ comment: 'Order within the meal type (for multiple snacks, etc.)' })
  meal_order: number;

  @Column({ length: 200 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('json', { comment: 'Array of ingredients with quantities' })
  ingredients: object[];

  @Column()
  calories: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true, comment: 'Protein in grams' })
  protein: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true, comment: 'Carbohydrates in grams' })
  carbs: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true, comment: 'Fats in grams' })
  fats: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true, comment: 'Fiber in grams' })
  fiber: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true, comment: 'Sugar in grams' })
  sugar: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany('MealProgress', 'mealItem')
  progress: any[];
}
