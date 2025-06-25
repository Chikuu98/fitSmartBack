import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/core/users/user.entity';

@Entity('mentor_details')
export class MentorDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.mentorDetails, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ length: 255 })
  expertise: string;

  @Column({ length: 255, nullable: true })
  bio: string;

  @Column({ length: 255, nullable: true })
  certifications: string;

  @Column({ length: 255, nullable: true })
  social_links: string;

  @Column({ length: 20, nullable: true })
  contact_number: string;
}
