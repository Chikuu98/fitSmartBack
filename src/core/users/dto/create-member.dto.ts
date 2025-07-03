import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Gender } from '@/core/users/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { FitnessLevel } from '@/core/users/members/member_detail.entity';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @ApiProperty({ example: 'Chiran Jeewantha' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'chiran@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 255)
  @ApiProperty({ example: 'password123' })
  password: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  @ApiProperty({ enum: ['male', 'female', 'other'] })
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Sri Lanka' })
  country: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'English' })
  language: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ example: 26 })
  age: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 175.0 })
  height: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 70.5 })
  weight: number;

  @IsOptional()
  @IsEnum(FitnessLevel)
  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'] })
  fitness_level: FitnessLevel;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Lose weight' })
  goal: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Vegetarian' })
  dietary_preference: string;
}
