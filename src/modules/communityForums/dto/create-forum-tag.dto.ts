import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateForumTagDto {
  @ApiProperty({
    example: 'nutrition',
    description: 'Tag name for categorizing threads',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
