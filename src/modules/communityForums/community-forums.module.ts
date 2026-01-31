import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumType } from './entities/forum-type.entity';
import { ForumThread } from './entities/forum-thread.entity';
import { ForumReply } from './entities/forum-reply.entity';
import { ForumTag } from './entities/forum-tag.entity';
import { ForumLike } from './entities/forum-like.entity';
import { User } from '@/core/users/user.entity';

import { ForumTypeService } from './services/forum-type.service';
import { ForumTagService } from './services/forum-tag.service';
import { ForumThreadService } from './services/forum-thread.service';
import { ForumReplyService } from './services/forum-reply.service';
import { ForumLikeService } from './services/forum-like.service';

import { ForumTypeController } from './controllers/forum-type.controller';
import { ForumTagController } from './controllers/forum-tag.controller';
import { ForumThreadController } from './controllers/forum-thread.controller';
import { ForumReplyController } from './controllers/forum-reply.controller';
import { ForumLikeController } from './controllers/forum-like.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ForumType,
      ForumThread,
      ForumReply,
      ForumTag,
      ForumLike,
      User,
    ]),
  ],
  providers: [
    ForumTypeService,
    ForumTagService,
    ForumThreadService,
    ForumReplyService,
    ForumLikeService,
  ],
  controllers: [
    ForumTypeController,
    ForumTagController,
    ForumThreadController,
    ForumReplyController,
    ForumLikeController,
  ],
  exports: [
    TypeOrmModule,
    ForumTypeService,
    ForumTagService,
    ForumThreadService,
    ForumReplyService,
    ForumLikeService,
  ],
})
export class CommunityForumsModule {}
