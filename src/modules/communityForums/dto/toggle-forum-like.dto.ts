import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ToggleForumLikeDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the thread to like/unlike',
  })
  @IsOptional()
  @IsInt()
  thread_id?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'ID of the reply to like/unlike',
  })
  @IsOptional()
  @IsInt()
  reply_id?: number;
}
