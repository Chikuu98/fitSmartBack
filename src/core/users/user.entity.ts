import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MemberDetail } from '@/core/users/members/member_detail.entity';
import { MentorDetail } from '@/core/users/mentors/mentor_detail.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum UserRole {
  MEMBER = 'member',
  MENTOR = 'mentor',
  ADMIN = 'admin',
}

export enum UserAccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  PENDING_REVIEW = 'pending_review',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Exclude()
  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ length: 100 })
  country: string;

  @Column({ length: 100 })
  language: string;

  @Column({ type: 'enum', enum: UserAccountStatus, default: UserAccountStatus.ACTIVE })
  status: UserAccountStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => MemberDetail, (details) => details.user, { cascade: true })
  memberDetail: MemberDetail;

  @OneToOne(() => MentorDetail, (details) => details.user, { cascade: true })
  mentorDetail: MentorDetail;
}
