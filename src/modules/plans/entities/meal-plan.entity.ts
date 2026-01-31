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

@Entity('meal_plans')
@Index('IDX_meal_plans_plan_day', ['acceptedPlan', 'day_number'])
export class MealPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AcceptedPlan, (plan) => plan.mealPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accepted_plan_id' })
  acceptedPlan: AcceptedPlan;

  @Column({ comment: '1-7 for weekly plans, can extend for custom durations' })
  day_number: number;

  @Column({ length: 100, comment: 'Day name or description (e.g., "Day 1: Balanced Nutrition")' })
  day_name: string;

  @Column({ comment: 'Total daily calories' })
  total_calories: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true, comment: 'Total protein in grams' })
  total_protein: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true, comment: 'Total carbohydrates in grams' })
  total_carbs: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true, comment: 'Total fats in grams' })
  total_fats: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true, comment: 'Total fiber in grams' })
  total_fiber: number;

  @Column('text', { nullable: true, comment: 'Daily meal plan notes' })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany('MealItem', 'mealPlan')
  meals: any[];
}
