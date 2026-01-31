import { PartialType } from '@nestjs/swagger';
import { CreateForumTagDto } from './create-forum-tag.dto';

export class UpdateForumTagDto extends PartialType(CreateForumTagDto) {}
