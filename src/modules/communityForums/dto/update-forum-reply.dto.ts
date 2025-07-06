import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateForumReplyDto } from './create-forum-reply.dto';

export class UpdateForumReplyDto extends PartialType(
  OmitType(CreateForumReplyDto, ['thread_id', 'parent_id'] as const)
) {}
