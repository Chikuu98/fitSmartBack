import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ForumReply } from '../entities/forum-reply.entity';
import { ForumThread } from '../entities/forum-thread.entity';
import { User } from '@/core/users/user.entity';
import { CreateForumReplyDto } from '../dto/create-forum-reply.dto';
import { UpdateForumReplyDto } from '../dto/update-forum-reply.dto';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class ForumReplyService {
  constructor(
    @InjectRepository(ForumReply)
    private readonly forumReplyRepo: Repository<ForumReply>,
    @InjectRepository(ForumThread)
    private readonly forumThreadRepo: Repository<ForumThread>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateForumReplyDto, userId: number): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const thread = await this.forumThreadRepo.findOne({ where: { id: dto.thread_id } });
    if (!thread) {
      throw new NotFoundException('Forum thread not found');
    }

    if (dto.parent_id) {
      const parentReply = await this.forumReplyRepo.findOne({ 
        where: { id: dto.parent_id, thread_id: dto.thread_id } 
      });
      if (!parentReply) {
        throw new NotFoundException('Parent reply not found or does not belong to this thread');
      }
    }

    const reply = this.forumReplyRepo.create({
      thread_id: dto.thread_id,
      user_id: userId,
      content: dto.content,
      parent_id: dto.parent_id || undefined,
    });

    const savedReply = await this.forumReplyRepo.save(reply);
    
    // Fetch the complete reply with relations
    const completeReply = await this.forumReplyRepo.findOne({
      where: { id: savedReply.id },
      relations: ['user', 'likes'],
    });

    if (!completeReply) {
      throw new NotFoundException('Created reply not found');
    }

    // Notify thread owner if the replier is not the thread owner
    if (thread.user_id !== userId) {
      await this.notificationsService.notifyForumReply(
        thread.user_id,
        user.name,
        thread.id,
        thread.title,
      );
    }

    // Add computed count fields
    const replyWithCounts = {
      ...completeReply,
      likeCount: completeReply.likes ? completeReply.likes.length : 0,
    };
    
    return {
      success: true,
      message: 'Forum reply added successfully',
      data: replyWithCounts,
    };
  }

  async findAll(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.forumReplyRepo.findAndCount({
      relations: ['user', 'thread', 'parent', 'children', 'likes'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Add computed count fields for each reply
    const repliesWithCounts = data.map(reply => ({
      ...reply,
      likeCount: reply.likes ? reply.likes.length : 0,
    }));

    return {
      success: true,
      data: {
        data: repliesWithCounts,
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: number): Promise<any> {
    const reply = await this.forumReplyRepo.findOne({
      where: { id },
      relations: [
        'user',
        'thread',
        'parent',
        'parent.user',
        'children',
        'children.user',
        'likes',
        'likes.user',
      ],
    });

    if (!reply) {
      throw new NotFoundException('Forum reply not found');
    }

    // Add computed count fields
    const replyWithCounts = {
      ...reply,
      likeCount: reply.likes ? reply.likes.length : 0,
    };

    return {
      success: true,
      data: replyWithCounts,
    };
  }

  async findByThread(threadId: number, page: number = 1, limit: number = 20): Promise<any> {
    const thread = await this.forumThreadRepo.findOne({ where: { id: threadId } });
    if (!thread) {
      throw new NotFoundException('Forum thread not found');
    }

    const skip = (page - 1) * limit;

    // Get top-level replies (no parent) with nested children
    const [data, total] = await this.forumReplyRepo.findAndCount({
      where: { thread_id: threadId, parent_id: IsNull() },
      relations: [
        'user',
        'children',
        'children.user',
        'children.children',
        'children.children.user',
        'children.likes',
        'children.likes.user',
        'children.children.likes',
        'children.children.likes.user',
        'likes',
        'likes.user',
      ],
      order: { created_at: 'ASC' },
      skip,
      take: limit,
    });

    // Recursively add computed count fields to all nested replies
    const addCountsToReply = (reply: any): any => {
      const replyWithCounts = {
        ...reply,
        likeCount: reply.likes ? reply.likes.length : 0,
      };

      if (reply.children && Array.isArray(reply.children)) {
        replyWithCounts.children = reply.children.map(addCountsToReply);
      }

      return replyWithCounts;
    };

    const repliesWithCounts = data.map(addCountsToReply);

    return {
      success: true,
      data: {
        data: repliesWithCounts,
        total,
        page,
        limit,
      },
    };
  }

  async findByUser(userId: number, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.forumReplyRepo.findAndCount({
      where: { user_id: userId },
      relations: ['user', 'thread', 'parent', 'likes'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Add computed count fields for each reply
    const repliesWithCounts = data.map(reply => ({
      ...reply,
      likeCount: reply.likes ? reply.likes.length : 0,
    }));

    return {
      success: true,
      data: {
        data: repliesWithCounts,
        total,
        page,
        limit,
      },
    };
  }

  async update(id: number, dto: UpdateForumReplyDto, userId: number): Promise<any> {
    const reply = await this.findOne(id);
    const replyData = reply.data;

    if (replyData.user_id !== userId) {
      throw new ForbiddenException('You can only update your own replies');
    }

    Object.assign(replyData, {
      content: dto.content ?? replyData.content,
    });

    const updatedReply = await this.forumReplyRepo.save(replyData);
    
    // Fetch the complete updated reply with relations
    const completeReply = await this.forumReplyRepo.findOne({
      where: { id: updatedReply.id },
      relations: ['user', 'likes'],
    });

    if (!completeReply) {
      throw new NotFoundException('Updated reply not found');
    }

    // Add computed count fields
    const replyWithCounts = {
      ...completeReply,
      likeCount: completeReply.likes ? completeReply.likes.length : 0,
    };
    
    return {
      success: true,
      message: 'Forum reply updated successfully',
      data: replyWithCounts,
    };
  }

  async remove(id: number, userId: number): Promise<any> {
    const reply = await this.findOne(id);
    const replyData = reply.data;

    if (replyData.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own replies');
    }

    await this.forumReplyRepo.remove(replyData);
    
    return {
      success: true,
      message: 'Forum reply deleted successfully',
    };
  }

  async getReplyTree(threadId: number): Promise<any> {
    const thread = await this.forumThreadRepo.findOne({ where: { id: threadId } });
    if (!thread) {
      throw new NotFoundException('Forum thread not found');
    }

    // Get all replies for the thread and build the tree structure
    const allReplies = await this.forumReplyRepo.find({
      where: { thread_id: threadId },
      relations: ['user', 'likes', 'likes.user'],
      order: { created_at: 'ASC' },
    });

    // Build the tree structure
    const replyMap = new Map<number, ForumReply & { children: ForumReply[] }>();
    const rootReplies: ForumReply[] = [];

    // First pass: create map of all replies
    allReplies.forEach(reply => {
      replyMap.set(reply.id, { ...reply, children: [] });
    });

    // Second pass: build the tree
    allReplies.forEach(reply => {
      const replyWithChildren = replyMap.get(reply.id)!;
      
      if (reply.parent_id) {
        const parent = replyMap.get(reply.parent_id);
        if (parent) {
          parent.children.push(replyWithChildren);
        }
      } else {
        rootReplies.push(replyWithChildren);
      }
    });

    return {
      success: true,
      data: rootReplies,
    };
  }
}
