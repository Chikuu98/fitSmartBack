import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { Gender, FitnessLevel } from '../user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'Chiran Jeewantha' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'chiran@example.com' })
  email: string;

  @IsString()
  @Length(6, 255)
  @ApiProperty({ example: 'password123' })
  password: string;

  @IsEnum(Gender)
  @ApiProperty({ enum: ['male', 'female', 'other'] })
  gender: Gender;

  @IsInt()
  @ApiProperty({ example: 26 })
  age: number;

  @IsNumber()
  @ApiProperty({ example: 175.0 })
  height: number;

  @IsNumber()
  @ApiProperty({ example: 70.5 })
  weight: number;

  @IsEnum(FitnessLevel)
  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'] })
  fitness_level: FitnessLevel;

  @IsString()
  @ApiProperty({ example: 'Lose weight' })
  goal: string;

  @IsString()
  @ApiProperty({ example: 'Vegetarian' })
  dietary_preference: string;
}
