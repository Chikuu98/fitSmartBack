import {
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMentorDetailsDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  @ApiPropertyOptional({ 
    example: 'Nutrition and Weight Management Expert',
    description: 'Mentor area of expertise'
  })
  expertise?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  @ApiPropertyOptional({
    example: 'Certified nutritionist and fitness trainer with over 15 years of experience helping clients achieve their health and wellness goals.',
    description: 'Mentor biography'
  })
  bio?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  @ApiPropertyOptional({ 
    example: 'ACE, NASM, RD',
    description: 'Mentor certifications'
  })
  certifications?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  @ApiPropertyOptional({ 
    example: 'https://linkedin.com/in/drjohnsmith',
    description: 'Mentor social media links'
  })
  social_links?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  @ApiPropertyOptional({ 
    example: '+1234567890',
    description: 'Mentor contact number'
  })
  contact_number?: string;
}
