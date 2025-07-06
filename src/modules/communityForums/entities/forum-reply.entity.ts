import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '@/core/users/user.entity';
import { ForumThread } from './forum-thread.entity';
import { ForumLike } from './forum-like.entity';

@Entity('forum_replies')
export class ForumReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  thread_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  parent_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => ForumThread, (thread) => thread.replies)
  @JoinColumn({ name: 'thread_id' })
  thread: ForumThread;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ForumReply, (reply) => reply.children)
  @JoinColumn({ name: 'parent_id' })
  parent: ForumReply;

  @OneToMany(() => ForumReply, (reply) => reply.parent)
  children: ForumReply[];

  @OneToMany(() => ForumLike, (like) => like.reply)
  likes: ForumLike[];
}
