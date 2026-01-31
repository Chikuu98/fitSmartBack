import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { User } from '@/core/users/user.entity';
import { PlanType } from './plan-type.entity';
import { AcceptedPlan } from './accepted-plan.entity';

export enum GenerationStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('generated_plans')
@Index('IDX_generated_plans_user_created', ['user', 'created_at'])
@Index('IDX_generated_plans_status', ['status'])
export class GeneratedPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PlanType, (planType) => planType.generatedPlans, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_type_id' })
  planType: PlanType;

  @Column({ default: 7, comment: 'Plan duration in days' })
  duration_days: number;

  @Column('json', { comment: 'User profile data sent to OpenAI' })
  prompt_data: object;

  @Column('json', { nullable: true, comment: 'Raw response from Gemini/OpenAI API' })
  ai_response: object;

  @Column({ length: 50, nullable: true, comment: 'AI model used for generation' })
  generation_model: string;

  @Column({ type: 'enum', enum: GenerationStatus, default: GenerationStatus.COMPLETED })
  status: GenerationStatus;

  @Column('text', { nullable: true })
  error_message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => AcceptedPlan, (acceptedPlan) => acceptedPlan.generatedPlan)
  acceptedPlan: AcceptedPlan;
}
