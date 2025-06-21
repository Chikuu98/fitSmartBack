import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column()
  age: number;

  @Column('decimal', { precision: 5, scale: 2 })
  height: number;

  @Column('decimal', { precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'enum', enum: FitnessLevel })
  fitness_level: FitnessLevel;

  @Column({ length: 100 })
  goal: string;

  @Column({ length: 100 })
  dietary_preference: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
