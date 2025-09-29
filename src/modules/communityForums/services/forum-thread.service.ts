import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumThread } from '../entities/forum-thread.entity';
import { ForumType } from '../entities/forum-type.entity';
import { ForumTag } from '../entities/forum-tag.entity';
import { User } from '@/core/users/user.entity';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';
import { UpdateForumThreadDto } from '../dto/update-forum-thread.dto';
import { ForumTagService } from './forum-tag.service';

@Injectable()
export class ForumThreadService {
  constructor(
    @InjectRepository(ForumThread)
    private readonly forumThreadRepo: Repository<ForumThread>,
    @InjectRepository(ForumType)
    private readonly forumTypeRepo: Repository<ForumType>,
    @InjectRepository(ForumTag)
    private readonly forumTagRepo: Repository<ForumTag>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly forumTagService: ForumTagService,
  ) {}

  async create(dto: CreateForumThreadDto, userId: number): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let forumType: ForumType | null = null;
    if (dto.forum_id) {
      forumType = await this.forumTypeRepo.findOne({ where: { id: dto.forum_id } });
      if (!forumType) {
        throw new NotFoundException('Forum type not found');
      }
    }

    const thread = this.forumThreadRepo.create({
      title: dto.title,
      content: dto.content,
      user_id: userId,
      forum_id: dto.forum_id || undefined,
    });

    const savedThread = await this.forumThreadRepo.save(thread);

    // Handle tags
    if (dto.tag_ids && dto.tag_ids.length > 0) {
      const tags = await this.forumTagRepo.findByIds(dto.tag_ids);
      if (!savedThread.tags) {
        savedThread.tags = [];
      }
      savedThread.tags = tags;
      await this.forumThreadRepo.save(savedThread);
    }

    // Fetch the complete thread with all relations
    const completeThread = await this.forumThreadRepo.findOne({
      where: { id: savedThread.id },
      relations: ['user', 'forumType', 'tags', 'likes', 'replies']
    });

    // Add computed fields for like count and reply count
    const threadWithCounts = completeThread ? {
      ...completeThread,
      likeCount: completeThread.likes ? completeThread.likes.length : 0,
      replyCount: completeThread.replies ? completeThread.replies.length : 0,
    } : null;

    return {
      success: true,
      message: 'Forum thread created successfully',
      data: threadWithCounts,
    };
  }

  async findAll(page: number = 1, limit: number = 10, forumId?: number, tagId?: number, currentUserId?: number): Promise<any> {
    const queryBuilder = this.forumThreadRepo.createQueryBuilder('thread')
      .leftJoinAndSelect('thread.user', 'user')
      .leftJoinAndSelect('thread.forumType', 'forumType')
      .leftJoinAndSelect('thread.tags', 'tags')
      .leftJoinAndSelect('thread.replies', 'replies')
      .leftJoinAndSelect('replies.likes', 'replyLikes')
      .leftJoinAndSelect('thread.likes', 'likes')
      .orderBy('thread.created_at', 'DESC');

    if (forumId) {
      queryBuilder.andWhere('thread.forum_id = :forumId', { forumId });
    }

    if (tagId) {
      queryBuilder.andWhere('tags.id = :tagId', { tagId });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Add computed fields for like count, reply count and current user like status
    const threadsWithCounts = data.map(thread => ({
      ...thread,
      likeCount: thread.likes ? thread.likes.length : 0,
      replyCount: thread.replies ? thread.replies.length : 0,
      isLikedByCurrentUser: currentUserId && thread.likes ? 
        thread.likes.some(like => like.user_id === currentUserId) : false,
    }));

    return {
      success: true,
      data: {
        data: threadsWithCounts,
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: number, currentUserId?: number): Promise<any> {
    const thread = await this.forumThreadRepo.findOne({
      where: { id },
      relations: [
        'user',
        'forumType',
        'tags',
        'replies',
        'replies.user',
        'replies.children',
        'replies.children.user',
        'likes',
        'likes.user',
      ],
    });

    if (!thread) {
      throw new NotFoundException('Forum thread not found');
    }

    // Add computed fields for like count, reply count and current user like status
    const threadWithCounts = {
      ...thread,
      likeCount: thread.likes ? thread.likes.length : 0,
      replyCount: thread.replies ? thread.replies.length : 0,
      isLikedByCurrentUser: currentUserId && thread.likes ? 
        thread.likes.some(like => like.user_id === currentUserId) : false,
    };

    return {
      success: true,
      data: threadWithCounts,
    };
  }

  async findByUser(userId: number, page: number = 1, limit: number = 10, currentUserId?: number): Promise<any> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.forumThreadRepo.findAndCount({
      where: { user_id: userId },
      relations: ['user', 'forumType', 'tags', 'replies', 'likes'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Add computed count fields for each thread
    const threadsWithCounts = data.map(thread => ({
      ...thread,
      likeCount: thread.likes ? thread.likes.length : 0,
      replyCount: thread.replies ? thread.replies.length : 0,
      isLikedByCurrentUser: currentUserId && thread.likes ? 
        thread.likes.some(like => like.user_id === currentUserId) : false,
    }));

    return {
      success: true,
      data: {
        data: threadsWithCounts,
        total,
        page,
        limit,
      },
    };
  }

  async update(id: number, dto: UpdateForumThreadDto, userId: number): Promise<any> {
    const threadResult = await this.findOne(id);
    const thread = threadResult.data;

    if (thread.user_id !== userId) {
      throw new ForbiddenException('You can only update your own threads');
    }

    if (dto.forum_id) {
      const forumType = await this.forumTypeRepo.findOne({ where: { id: dto.forum_id } });
      if (!forumType) {
        throw new NotFoundException('Forum type not found');
      }
    }

    Object.assign(thread, {
      title: dto.title ?? thread.title,
      content: dto.content ?? thread.content,
      forum_id: dto.forum_id ?? thread.forum_id,
    });

    // Handle tags update
    if (dto.tag_ids) {
      const tags = await this.forumTagRepo.findByIds(dto.tag_ids);
      thread.tags = tags;
    }

    await this.forumThreadRepo.save(thread);
    
    return {
      success: true,
      message: 'Forum thread updated successfully',
    };
  }

  async remove(id: number, userId: number): Promise<any> {
    const threadResult = await this.findOne(id);
    const thread = threadResult.data;

    if (thread.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own threads');
    }

    await this.forumThreadRepo.remove(thread);

    return {
      success: true,
      message: 'Forum thread deleted successfully',
    };
  }

  async search(query: string, page: number = 1, limit: number = 10, currentUserId?: number): Promise<any> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.forumThreadRepo.createQueryBuilder('thread')
      .leftJoinAndSelect('thread.user', 'user')
      .leftJoinAndSelect('thread.forumType', 'forumType')
      .leftJoinAndSelect('thread.tags', 'tags')
      .leftJoinAndSelect('thread.replies', 'replies')
      .leftJoinAndSelect('thread.likes', 'likes')
      .where('thread.title ILIKE :query OR thread.content ILIKE :query', { query: `%${query}%` })
      .orderBy('thread.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Add computed fields for like count, reply count and current user like status
    const threadsWithCounts = data.map(thread => ({
      ...thread,
      likeCount: thread.likes ? thread.likes.length : 0,
      replyCount: thread.replies ? thread.replies.length : 0,
      isLikedByCurrentUser: currentUserId && thread.likes ? 
        thread.likes.some(like => like.user_id === currentUserId) : false,
    }));

    return {
      success: true,
      data: {
        data: threadsWithCounts,
        total,
        page,
        limit,
      },
    };
  }
}
