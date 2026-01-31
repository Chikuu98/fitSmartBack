import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSocialLinkDto {
  @ApiPropertyOptional({ description: 'Social media platform name' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({
    description: 'URL to the social media profile',
    type: String,
    format: 'url',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;
}
