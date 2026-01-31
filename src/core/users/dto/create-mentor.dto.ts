import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
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
  @Length(8, 255, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    },
  )
  @IsNotEmpty()
  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
  })
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
  @ApiProperty({ example: '+94771234567', required: false })
  contact_number?: string;
}
