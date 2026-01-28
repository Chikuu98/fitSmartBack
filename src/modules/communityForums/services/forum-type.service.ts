import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumType } from '../entities/forum-type.entity';
import { CreateForumTypeDto } from '../dto/create-forum-type.dto';
import { UpdateForumTypeDto } from '../dto/update-forum-type.dto';

@Injectable()
export class ForumTypeService {
  constructor(
    @InjectRepository(ForumType)
    private readonly forumTypeRepo: Repository<ForumType>,
  ) {}

  async create(dto: CreateForumTypeDto): Promise<any> {
    const existingType = await this.forumTypeRepo.findOne({
      where: { title: dto.title },
    });

    if (existingType) {
      throw new BadRequestException('Forum type with this title already exists');
    }

    const forumType = this.forumTypeRepo.create(dto);
    await this.forumTypeRepo.save(forumType);

    return {
      success: true,
      message: 'Forum type created successfully',
    };
  }

  async findAll(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    
    const [forumTypes, total] = await this.forumTypeRepo.findAndCount({
      relations: ['threads'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: forumTypes,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<any> {
    const forumType = await this.forumTypeRepo.findOne({
      where: { id },
      relations: ['threads', 'threads.user'],
    });

    if (!forumType) {
      throw new NotFoundException('Forum type not found');
    }

    return {
      success: true,
      data: forumType,
    };
  }

  async update(id: number, dto: UpdateForumTypeDto): Promise<any> {
    const forumTypeResult = await this.findOne(id);
    const forumType = forumTypeResult.data;

    if (dto.title && dto.title !== forumType.title) {
      const existingType = await this.forumTypeRepo.findOne({
        where: { title: dto.title },
      });

      if (existingType && existingType.id !== id) {
        throw new BadRequestException('Forum type with this title already exists');
      }
    }

    Object.assign(forumType, dto);
    await this.forumTypeRepo.save(forumType);

    return {
      success: true,
      message: 'Forum type updated successfully',
    };
  }

  async remove(id: number): Promise<any> {
    const forumTypeResult = await this.findOne(id);
    const forumType = forumTypeResult.data;
    
    await this.forumTypeRepo.remove(forumType);

    return {
      success: true,
      message: 'Forum type deleted successfully',
    };
  }
}
