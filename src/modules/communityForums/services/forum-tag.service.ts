import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumTag } from '../entities/forum-tag.entity';
import { CreateForumTagDto } from '../dto/create-forum-tag.dto';
import { UpdateForumTagDto } from '../dto/update-forum-tag.dto';

@Injectable()
export class ForumTagService {
  constructor(
    @InjectRepository(ForumTag)
    private readonly forumTagRepo: Repository<ForumTag>,
  ) {}

  async create(dto: CreateForumTagDto): Promise<any> {
    const existingTag = await this.forumTagRepo.findOne({
      where: { name: dto.name.toLowerCase() },
    });

    if (existingTag) {
      throw new BadRequestException('Tag with this name already exists');
    }

    const forumTag = this.forumTagRepo.create({
      ...dto,
      name: dto.name.toLowerCase(),
    });
    await this.forumTagRepo.save(forumTag);

    return {
      success: true,
      message: 'Forum tag created successfully',
    };
  }

  async findAll(): Promise<any> {
    const forumTags = await this.forumTagRepo.find({
      relations: ['threads'],
      order: { name: 'ASC' },
    });

    return {
      success: true,
      data: forumTags,
    };
  }

  async findOne(id: number): Promise<any> {
    const forumTag = await this.forumTagRepo.findOne({
      where: { id },
      relations: ['threads', 'threads.user'],
    });

    if (!forumTag) {
      throw new NotFoundException('Forum tag not found');
    }

    return {
      success: true,
      data: forumTag,
    };
  }

  async findByName(name: string): Promise<any> {
    const forumTag = await this.forumTagRepo.findOne({
      where: { name: name.toLowerCase() },
      relations: ['threads'],
    });

    if (!forumTag) {
      throw new NotFoundException('Forum tag not found');
    }

    return {
      success: true,
      data: forumTag,
    };
  }

  async update(id: number, dto: UpdateForumTagDto): Promise<any> {
    const forumTagResult = await this.findOne(id);
    const forumTag = forumTagResult.data;

    if (dto.name && dto.name.toLowerCase() !== forumTag.name) {
      const existingTag = await this.forumTagRepo.findOne({
        where: { name: dto.name.toLowerCase() },
      });

      if (existingTag && existingTag.id !== id) {
        throw new BadRequestException('Tag with this name already exists');
      }
    }

    Object.assign(forumTag, { ...dto, name: dto.name?.toLowerCase() });
    await this.forumTagRepo.save(forumTag);

    return {
      success: true,
      message: 'Forum tag updated successfully',
    };
  }

  async remove(id: number): Promise<any> {
    const forumTagResult = await this.findOne(id);
    const forumTag = forumTagResult.data;
    
    await this.forumTagRepo.remove(forumTag);

    return {
      success: true,
      message: 'Forum tag deleted successfully',
    };
  }

  async findOrCreateTags(tagNames: string[]): Promise<ForumTag[]> {
    const tags: ForumTag[] = [];

    for (const tagName of tagNames) {
      const normalizedName = tagName.toLowerCase();
      let tag = await this.forumTagRepo.findOne({ where: { name: normalizedName } });

      if (!tag) {
        tag = this.forumTagRepo.create({ name: normalizedName });
        tag = await this.forumTagRepo.save(tag);
      }

      tags.push(tag);
    }

    return tags;
  }
}
