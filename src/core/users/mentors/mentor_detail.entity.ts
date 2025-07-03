
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Certification } from './certification.entity';
import { SocialLink } from './social_link.entity';
import { User } from '@/core/users/user.entity';

@Entity('mentor_details')
export class MentorDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.mentorDetail, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ length: 255 })
  expertise: string;


  @Column({ length: 255, nullable: true })
  bio: string;

  @OneToMany(() => Certification, (cert) => cert.mentorDetail, { cascade: true })
  certification: Certification[];

  @OneToMany(() => SocialLink, (link) => link.mentorDetail, { cascade: true })
  socialLink: SocialLink[];

  @Column({ length: 20, nullable: true })
  contact_number: string;
}
