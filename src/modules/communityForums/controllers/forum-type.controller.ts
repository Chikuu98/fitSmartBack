import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/users/user.entity';
import { ForumTypeService } from '../services/forum-type.service';
import { CreateForumTypeDto } from '../dto/create-forum-type.dto';
import { UpdateForumTypeDto } from '../dto/update-forum-type.dto';

@ApiTags('Forum Types')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('forum-types')
export class ForumTypeController {
  constructor(private readonly forumTypeService: ForumTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forum type/category' })
  @ApiResponse({ status: 201, description: 'Forum type created successfully' })
  @Roles(UserRole.ADMIN)
  async create(@Body() createDto: CreateForumTypeDto) {
    return await this.forumTypeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all forum types' })
  @ApiResponse({ status: 200, description: 'List of all forum types' })
  async findAll() {
    return await this.forumTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forum type by ID' })
  @ApiResponse({ status: 200, description: 'Forum type details' })
  @ApiResponse({ status: 404, description: 'Forum type not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.forumTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update forum type by ID' })
  @ApiResponse({ status: 200, description: 'Forum type updated successfully' })
  @ApiResponse({ status: 404, description: 'Forum type not found' })
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateForumTypeDto,
  ) {
    return await this.forumTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete forum type by ID' })
  @ApiResponse({ status: 200, description: 'Forum type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Forum type not found' })
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.forumTypeService.remove(id);
    return { message: 'Forum type deleted successfully' };
  }
}
