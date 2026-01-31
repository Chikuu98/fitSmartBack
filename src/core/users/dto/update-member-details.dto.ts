import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Length,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FitnessLevel } from '@/core/users/members/member_detail.entity';

export class UpdateMemberDetailsDto {
  @IsOptional()
  @IsInt()
  @Min(13)
  @Max(120)
  @ApiPropertyOptional({
    example: 26,
    description: 'Member age',
    minimum: 13,
    maximum: 120,
  })
  age?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(50)
  @Max(300)
  @ApiPropertyOptional({
    example: 175.5,
    description: 'Member height in cm',
    minimum: 50,
    maximum: 300,
  })
  height?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(500)
  @ApiPropertyOptional({
    example: 70.5,
    description: 'Member weight in kg',
    minimum: 20,
    maximum: 500,
  })
  weight?: number;

  @IsOptional()
  @IsEnum(FitnessLevel)
  @ApiPropertyOptional({
    enum: ['beginner', 'intermediate', 'advanced'],
    description: 'Member fitness level',
  })
  fitness_level?: FitnessLevel;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @ApiPropertyOptional({
    example: 'Build muscle and lose fat',
    description: 'Member fitness goal',
  })
  goal?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @ApiPropertyOptional({
    example: 'Vegan',
    description: 'Member dietary preference',
  })
  dietary_preference?: string;
}
