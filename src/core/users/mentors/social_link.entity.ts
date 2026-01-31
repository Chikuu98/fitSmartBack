import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MentorDetail } from './mentor_detail.entity';

@Entity('social_links')
export class SocialLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  platform: string;

  @Column({ length: 255 })
  url: string;

  @ManyToOne(() => MentorDetail, (mentor) => mentor.socialLink, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mentor_detail_id' })
  mentorDetail: MentorDetail;
}
