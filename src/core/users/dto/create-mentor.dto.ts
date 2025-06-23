import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Gender } from '@/core/users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMentorDto {
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'Mentor John' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'mentor@example.com' })
  email: string;

  @IsString()
  @Length(6, 255)
  @ApiProperty({ example: 'password123' })
  password: string;

  @IsEnum(Gender)
  @ApiProperty({ enum: ['male', 'female', 'other'] })
  gender: Gender;

  @IsString()
  @ApiProperty({ example: 'Fitness and Nutrition Expert' })
  expertise: string;

  @IsString()
  @ApiProperty({ example: 'Certified trainer with 10 years of experience.' })
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
