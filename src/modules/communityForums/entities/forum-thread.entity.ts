import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '@/core/users/user.entity';
import { ForumType } from './forum-type.entity';
import { ForumLike } from './forum-like.entity';

@Entity('forum_threads')
export class ForumThread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  forum_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ForumType, (forumType) => forumType.threads)
  @JoinColumn({ name: 'forum_id' })
  forumType: ForumType;

  @OneToMany('ForumReply', 'thread')
  replies: any[];

  @OneToMany(() => ForumLike, (like) => like.thread)
  likes: ForumLike[];

  @ManyToMany('ForumTag', 'threads')
  @JoinTable({
    name: 'forum_thread_tags',
    joinColumn: { name: 'thread_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: any[];
}
