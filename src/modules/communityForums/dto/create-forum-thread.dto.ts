import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateForumThreadDto {
  @ApiProperty({
    example: 'Best workout routines for beginners',
    description: 'Title of the forum thread',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'I am new to fitness and looking for some beginner-friendly workout routines. Any suggestions?',
    description: 'Content of the forum thread',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the forum category (optional)',
  })
  @IsOptional()
  @IsInt()
  forum_id?: number;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'Array of tag IDs to associate with the thread',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tag_ids?: number[];
}
