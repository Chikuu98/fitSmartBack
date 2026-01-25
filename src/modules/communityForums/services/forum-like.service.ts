import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumLike } from '../entities/forum-like.entity';
import { ForumThread } from '../entities/forum-thread.entity';
import { ForumReply } from '../entities/forum-reply.entity';
import { User } from '@/core/users/user.entity';
import { ToggleForumLikeDto } from '../dto/toggle-forum-like.dto';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class ForumLikeService {
  constructor(
    @InjectRepository(ForumLike)
    private readonly forumLikeRepo: Repository<ForumLike>,
    @InjectRepository(ForumThread)
    private readonly forumThreadRepo: Repository<ForumThread>,
    @InjectRepository(ForumReply)
    private readonly forumReplyRepo: Repository<ForumReply>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async toggleLike(dto: ToggleForumLikeDto, userId: number): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!dto.thread_id && !dto.reply_id) {
      throw new BadRequestException('Either thread_id or reply_id must be provided');
    }

    if (dto.thread_id && dto.reply_id) {
      throw new BadRequestException('Cannot like both thread and reply at the same time');
    }

    let thread: ForumThread | null = null;
    let reply: ForumReply | null = null;

    if (dto.thread_id) {
      thread = await this.forumThreadRepo.findOne({ where: { id: dto.thread_id } });
      if (!thread) {
        throw new NotFoundException('Forum thread not found');
      }
    }

    if (dto.reply_id) {
      reply = await this.forumReplyRepo.findOne({ 
        where: { id: dto.reply_id },
        relations: ['thread'],
      });
      if (!reply) {
        throw new NotFoundException('Forum reply not found');
      }
    }

    const existingLike = await this.forumLikeRepo.findOne({
      where: {
        user_id: userId,
        thread_id: dto.thread_id || undefined,
        reply_id: dto.reply_id || undefined,
      },
    });

    let action: 'liked' | 'unliked';

    if (existingLike) {
      await this.forumLikeRepo.remove(existingLike);
      action = 'unliked';
    } else {
      const like = this.forumLikeRepo.create({
        user_id: userId,
        thread_id: dto.thread_id || undefined,
        reply_id: dto.reply_id || undefined,
      });
      await this.forumLikeRepo.save(like);
      action = 'liked';

      if (thread && thread.user_id !== userId) {
        await this.notificationsService.notifyForumLike(
          thread.user_id,
          user.name,
          'thread',
          thread.id,
          thread.id,
        );
      } else if (reply && reply.user_id !== userId) {
        await this.notificationsService.notifyForumLike(
          reply.user_id,
          user.name,
          'reply',
          reply.id,
          reply.thread?.id || reply.thread_id,
        );
      }
    }

    const likeCount = await this.getLikesCount(dto.thread_id, dto.reply_id);

    return {
      success: true,
      data: {
        liked: action === 'liked',
        likeCount,
      },
    };
  }

  async getLikesCount(threadId?: number, replyId?: number): Promise<number> {
    const whereCondition: any = {};

    if (threadId) {
      whereCondition.thread_id = threadId;
    }

    if (replyId) {
      whereCondition.reply_id = replyId;
    }

    return await this.forumLikeRepo.count({ where: whereCondition });
  }

  async getUserLikes(userId: number, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.forumLikeRepo.findAndCount({
      where: { user_id: userId },
      relations: ['thread', 'thread.user', 'reply', 'reply.user', 'reply.thread'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: {
        data,
        total,
        page,
        limit,
      },
    };
  }

  async getThreadLikes(threadId: number, page: number = 1, limit: number = 10): Promise<any> {
    const thread = await this.forumThreadRepo.findOne({ where: { id: threadId } });
    if (!thread) {
      throw new NotFoundException('Forum thread not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.forumLikeRepo.findAndCount({
      where: { thread_id: threadId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: {
        data,
        total,
        page,
        limit,
      },
    };
  }

  async getReplyLikes(replyId: number, page: number = 1, limit: number = 10): Promise<any> {
    const reply = await this.forumReplyRepo.findOne({ where: { id: replyId } });
    if (!reply) {
      throw new NotFoundException('Forum reply not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.forumLikeRepo.findAndCount({
      where: { reply_id: replyId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: {
        data,
        total,
        page,
        limit,
      },
    };
  }

  async checkUserLike(userId: number, threadId?: number, replyId?: number): Promise<any> {
    const whereCondition: any = { user_id: userId };

    if (threadId) {
      whereCondition.thread_id = threadId;
    }

    if (replyId) {
      whereCondition.reply_id = replyId;
    }

    const like = await this.forumLikeRepo.findOne({ where: whereCondition });
    return {
      success: true,
      data: {
        isLiked: !!like,
      },
    };
  }
}
