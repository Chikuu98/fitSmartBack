import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateForumTypeDto {
  @ApiProperty({
    example: 'General Discussion',
    description: 'Title of the forum category',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'General discussions about fitness and health',
    description: 'Description of the forum category',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
