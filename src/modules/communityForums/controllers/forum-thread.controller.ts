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
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/users/user.entity';
import { ForumThreadService } from '../services/forum-thread.service';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';
import { UpdateForumThreadDto } from '../dto/update-forum-thread.dto';

@ApiTags('Forum Threads')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('forum-threads')
export class ForumThreadController {
  constructor(private readonly forumThreadService: ForumThreadService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forum thread' })
  @ApiResponse({ status: 201, description: 'Forum thread created successfully' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async create(@Body() createDto: CreateForumThreadDto, @Req() req: any) {
    return await this.forumThreadService.create(createDto, req.user.user_id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all forum threads with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'forumId', required: false, description: 'Filter by forum type ID' })
  @ApiQuery({ name: 'tagId', required: false, description: 'Filter by tag ID' })
  @ApiResponse({ status: 200, description: 'List of forum threads' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('forumId') forumId?: string,
    @Query('tagId') tagId?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const forumIdNum = forumId ? parseInt(forumId, 10) : undefined;
    const tagIdNum = tagId ? parseInt(tagId, 10) : undefined;

    return await this.forumThreadService.findAll(pageNum, limitNum, forumIdNum, tagIdNum);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search forum threads' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumThreadService.search(query, pageNum, limitNum);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get forum threads by user ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'User forum threads' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumThreadService.findByUser(userId, pageNum, limitNum);
  }

  @Get('my-threads')
  @ApiOperation({ summary: 'Get current user forum threads' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Current user forum threads' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async findMyThreads(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumThreadService.findByUser(req.user.user_id, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forum thread by ID' })
  @ApiResponse({ status: 200, description: 'Forum thread details' })
  @ApiResponse({ status: 404, description: 'Forum thread not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.forumThreadService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update forum thread by ID' })
  @ApiResponse({ status: 200, description: 'Forum thread updated successfully' })
  @ApiResponse({ status: 404, description: 'Forum thread not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only update own threads' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateForumThreadDto,
    @Req() req: any,
  ) {
    return await this.forumThreadService.update(id, updateDto, req.user.user_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete forum thread by ID' })
  @ApiResponse({ status: 200, description: 'Forum thread deleted successfully' })
  @ApiResponse({ status: 404, description: 'Forum thread not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only delete own threads' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.forumThreadService.remove(id, req.user.user_id);
    return { message: 'Forum thread deleted successfully' };
  }
}
