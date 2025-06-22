import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user.entity';

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('member_details')
export class MemberDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.memberDetails, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  age: number;

  @Column('decimal', { precision: 5, scale: 2 })
  height: number;

  @Column('decimal', { precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'enum', enum: FitnessLevel, default: FitnessLevel.BEGINNER })
  fitness_level: FitnessLevel;

  @Column({ length: 100 })
  goal: string;

  @Column({ length: 100 })
  dietary_preference: string;
}
