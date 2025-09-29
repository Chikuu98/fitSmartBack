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
import { ForumReplyService } from '../services/forum-reply.service';
import { CreateForumReplyDto } from '../dto/create-forum-reply.dto';
import { UpdateForumReplyDto } from '../dto/update-forum-reply.dto';

@ApiTags('Forum Replies')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('forum-replies')
export class ForumReplyController {
  constructor(private readonly forumReplyService: ForumReplyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forum reply' })
  @ApiResponse({ status: 201, description: 'Forum reply added successfully' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async create(@Body() createDto: CreateForumReplyDto, @Req() req: any) {
    return await this.forumReplyService.create(createDto, req.user.user_id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all forum replies with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'List of forum replies' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumReplyService.findAll(pageNum, limitNum);
  }

  @Get('thread/:threadId')
  @ApiOperation({ summary: 'Get replies for a specific thread' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiResponse({ status: 200, description: 'Thread replies' })
  async findByThread(
    @Param('threadId', ParseIntPipe) threadId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumReplyService.findByThread(threadId, pageNum, limitNum);
  }

  @Get('thread/:threadId/tree')
  @ApiOperation({ summary: 'Get complete reply tree for a thread' })
  @ApiResponse({ status: 200, description: 'Complete reply tree with nested structure' })
  async getReplyTree(@Param('threadId', ParseIntPipe) threadId: number) {
    return await this.forumReplyService.getReplyTree(threadId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get forum replies by user ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'User forum replies' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumReplyService.findByUser(userId, pageNum, limitNum);
  }

  @Get('my-replies')
  @ApiOperation({ summary: 'Get current user forum replies' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Current user forum replies' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async findMyReplies(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumReplyService.findByUser(req.user.user_id, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forum reply by ID' })
  @ApiResponse({ status: 200, description: 'Forum reply details' })
  @ApiResponse({ status: 404, description: 'Forum reply not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.forumReplyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update forum reply by ID' })
  @ApiResponse({ status: 200, description: 'Forum reply updated successfully' })
  @ApiResponse({ status: 404, description: 'Forum reply not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only update own replies' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateForumReplyDto,
    @Req() req: any,
  ) {
    return await this.forumReplyService.update(id, updateDto, req.user.user_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete forum reply by ID' })
  @ApiResponse({ status: 200, description: 'Forum reply deleted successfully' })
  @ApiResponse({ status: 404, description: 'Forum reply not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only delete own replies' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.forumReplyService.remove(id, req.user.user_id);
    return { message: 'Forum reply deleted successfully' };
  }
}
