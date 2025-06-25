import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Gender } from '@/core/users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMentorDto {
  @IsString()
  @Length(1, 100)
  @IsNotEmpty()
  @ApiProperty({ example: 'Mentor John' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'mentor@example.com' })
  email: string;

  @IsString()
  @Length(6, 255)
  @IsNotEmpty()
  @ApiProperty({ example: 'password123' })
  password: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  @ApiProperty({ enum: ['male', 'female', 'other'] })
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Fitness and Nutrition Expert' })
  expertise: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Sri Lanka' })
  country: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'English' })
  language: string;

  @IsOptional()
  @ApiProperty({
    example: 'Certified trainer with 10 years of experience.',
    required: false,
  })
  bio: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'ACE, NASM', required: false })
  certifications?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'https://linkedin.com/in/mentor', required: false })
  social_links?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '+94771234567', required: false })
  contact_number?: string;
}
