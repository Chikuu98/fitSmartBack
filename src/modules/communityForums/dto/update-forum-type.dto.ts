import { PartialType } from '@nestjs/swagger';
import { CreateForumTypeDto } from './create-forum-type.dto';

export class UpdateForumTypeDto extends PartialType(CreateForumTypeDto) {}
