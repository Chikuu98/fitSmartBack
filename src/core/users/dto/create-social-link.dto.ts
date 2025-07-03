import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSocialLinkDto {
  @ApiProperty({ description: 'Social media platform name' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({
    description: 'URL to the social media profile',
    type: String,
    format: 'url',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
