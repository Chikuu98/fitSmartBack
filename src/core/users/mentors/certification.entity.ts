import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MentorDetail } from './mentor_detail.entity';

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  issuer: string;

  @Column({ type: 'date', nullable: true })
  issue_date: Date;

  @ManyToOne(() => MentorDetail, (mentor) => mentor.certification, { onDelete: 'CASCADE' })
  mentorDetail: MentorDetail;
}
