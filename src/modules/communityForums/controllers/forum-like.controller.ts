import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ParseIntPipe,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/users/user.entity';
import { ForumLikeService } from '../services/forum-like.service';
import { ToggleForumLikeDto } from '../dto/toggle-forum-like.dto';

@ApiTags('Forum Likes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('forum-likes')
export class ForumLikeController {
  constructor(private readonly forumLikeService: ForumLikeService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle like/unlike on thread or reply' })
  @ApiResponse({ status: 200, description: 'Like toggled successfully' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async toggleLike(@Body() toggleDto: ToggleForumLikeDto, @Req() req: any) {
    return await this.forumLikeService.toggleLike(toggleDto, req.user.user_id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get likes by user ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'User likes' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async getUserLikes(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumLikeService.getUserLikes(userId, pageNum, limitNum);
  }

  @Get('my-likes')
  @ApiOperation({ summary: 'Get current user likes' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Current user likes' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async getMyLikes(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumLikeService.getUserLikes(req.user.user_id, pageNum, limitNum);
  }

  @Get('thread/:threadId')
  @ApiOperation({ summary: 'Get likes for a specific thread' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Thread likes' })
  async getThreadLikes(
    @Param('threadId', ParseIntPipe) threadId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumLikeService.getThreadLikes(threadId, pageNum, limitNum);
  }

  @Get('reply/:replyId')
  @ApiOperation({ summary: 'Get likes for a specific reply' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Reply likes' })
  async getReplyLikes(
    @Param('replyId', ParseIntPipe) replyId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return await this.forumLikeService.getReplyLikes(replyId, pageNum, limitNum);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if user liked a thread or reply' })
  @ApiQuery({ name: 'threadId', required: false, description: 'Thread ID to check' })
  @ApiQuery({ name: 'replyId', required: false, description: 'Reply ID to check' })
  @ApiResponse({ status: 200, description: 'Like status check result' })
  @Roles(UserRole.MEMBER, UserRole.MENTOR, UserRole.ADMIN)
  async checkUserLike(
    @Req() req: any,
    @Query('threadId') threadId?: string,
    @Query('replyId') replyId?: string,
  ) {
    const threadIdNum = threadId ? parseInt(threadId, 10) : undefined;
    const replyIdNum = replyId ? parseInt(replyId, 10) : undefined;

    const isLiked = await this.forumLikeService.checkUserLike(
      req.user.user_id,
      threadIdNum,
      replyIdNum,
    );

    return { isLiked };
  }
}
