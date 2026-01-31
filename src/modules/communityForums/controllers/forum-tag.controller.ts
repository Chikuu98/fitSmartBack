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
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/users/user.entity';
import { ForumTagService } from '../services/forum-tag.service';
import { CreateForumTagDto } from '../dto/create-forum-tag.dto';
import { UpdateForumTagDto } from '../dto/update-forum-tag.dto';

@ApiTags('Forum Tags')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('forum-tags')
export class ForumTagController {
  constructor(private readonly forumTagService: ForumTagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forum tag' })
  @ApiResponse({ status: 201, description: 'Forum tag created successfully' })
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  async create(@Body() createDto: CreateForumTagDto) {
    return await this.forumTagService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all forum tags with pagination and optional search' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 10 })
  @ApiQuery({ name: 'search', description: 'Search term to filter tags by name', required: false })
  @ApiResponse({ status: 200, description: 'List of all forum tags with pagination' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return await this.forumTagService.findAll(page, limit, search);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search forum tag by name' })
  @ApiQuery({ name: 'name', description: 'Tag name to search for', required: true })
  @ApiResponse({ status: 200, description: 'Forum tag found' })
  @ApiResponse({ status: 404, description: 'Forum tag not found' })
  async findByName(@Query('name') name: string) {
    return await this.forumTagService.findByName(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forum tag by ID' })
  @ApiResponse({ status: 200, description: 'Forum tag details' })
  @ApiResponse({ status: 404, description: 'Forum tag not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.forumTagService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update forum tag by ID' })
  @ApiResponse({ status: 200, description: 'Forum tag updated successfully' })
  @ApiResponse({ status: 404, description: 'Forum tag not found' })
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateForumTagDto,
  ) {
    return await this.forumTagService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete forum tag by ID' })
  @ApiResponse({ status: 200, description: 'Forum tag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Forum tag not found' })
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.forumTagService.remove(id);
    return { message: 'Forum tag deleted successfully' };
  }
}
