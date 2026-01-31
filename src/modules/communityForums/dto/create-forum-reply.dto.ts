import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateForumReplyDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the thread being replied to',
  })
  @IsInt()
  thread_id: number;

  @ApiProperty({
    example: 'I recommend starting with basic bodyweight exercises like push-ups and squats.',
    description: 'Content of the reply',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'ID of the parent reply (for nested replies)',
  })
  @IsOptional()
  @IsInt()
  parent_id?: number;
}
