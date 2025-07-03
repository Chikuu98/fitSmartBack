import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/core/users/user.entity';

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('member_details')
export class MemberDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.memberDetail, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  age: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  height: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({
    type: 'enum',
    enum: FitnessLevel,
    default: FitnessLevel.BEGINNER,
    nullable: true,
  })
  fitness_level: FitnessLevel;

  @Column({ length: 100, nullable: true })
  goal: string;

  @Column({ length: 100, nullable: true })
  dietary_preference: string;
}
