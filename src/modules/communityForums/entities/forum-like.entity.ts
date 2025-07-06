import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '@/core/users/user.entity';
import { ForumThread } from './forum-thread.entity';
import { ForumReply } from './forum-reply.entity';

@Entity('forum_likes')
@Unique(['user_id', 'thread_id', 'reply_id'])
export class ForumLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  thread_id: number;

  @Column({ nullable: true })
  reply_id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ForumThread, (thread) => thread.likes)
  @JoinColumn({ name: 'thread_id' })
  thread: ForumThread;

  @ManyToOne(() => ForumReply, (reply) => reply.likes)
  @JoinColumn({ name: 'reply_id' })
  reply: ForumReply;
}
