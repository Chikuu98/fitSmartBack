import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { MealStatus, HungerLevel, FullnessLevel } from '../entities/meal-progress.entity';

export class CreateMealProgressDto {
  @ApiProperty({ 
    description: 'Meal item ID',
    example: 1
  })
  @IsNumber()
  meal_item_id: number;

  @ApiProperty({ 
    description: 'Meal consumption status',
    enum: MealStatus,
    default: MealStatus.NOT_CONSUMED
  })
  @IsOptional()
  @IsEnum(MealStatus)
  status?: MealStatus = MealStatus.NOT_CONSUMED;

  @ApiProperty({ 
    description: 'Percentage of planned portion consumed (0-100)',
    example: 80,
    minimum: 0,
    maximum: 100,
    default: 100
  })
  @IsOptional()
  @IsNumber()
  portion_percentage?: number = 100;

  @ApiProperty({ 
    description: 'Satisfaction rating (1-10)',
    example: 8,
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  satisfaction_rating?: number;

  @ApiProperty({ 
    description: 'Taste rating (1-10)',
    example: 9,
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  taste_rating?: number;

  @ApiProperty({ 
    description: 'Hunger level before eating',
    enum: HungerLevel,
    required: false
  })
  @IsOptional()
  @IsEnum(HungerLevel)
  hunger_before?: HungerLevel;

  @ApiProperty({ 
    description: 'Fullness level after eating',
    enum: FullnessLevel,
    required: false
  })
  @IsOptional()
  @IsEnum(FullnessLevel)
  hunger_after?: FullnessLevel;

  @ApiProperty({ 
    description: 'Ingredient substitutions made',
    example: [{ original: 'chicken', substitute: 'tofu', reason: 'dietary preference' }],
    required: false
  })
  @IsOptional()
  @IsArray()
  substitutions?: any[];

  @ApiProperty({ 
    description: 'Meal notes',
    example: 'Delicious and filling, will make again',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMealProgressDto {
  @ApiProperty({ 
    description: 'Meal consumption status',
    enum: MealStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(MealStatus)
  status?: MealStatus;

  @ApiProperty({ 
    description: 'Percentage of planned portion consumed (0-100)',
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
  portion_percentage?: number;

  @ApiProperty({ 
    description: 'Satisfaction rating (1-10)',
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  satisfaction_rating?: number;

  @ApiProperty({ 
    description: 'Taste rating (1-10)',
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  taste_rating?: number;

  @ApiProperty({ 
    description: 'Hunger level before eating',
    enum: HungerLevel,
    required: false
  })
  @IsOptional()
  @IsEnum(HungerLevel)
  hunger_before?: HungerLevel;

  @ApiProperty({ 
    description: 'Fullness level after eating',
    enum: FullnessLevel,
    required: false
  })
  @IsOptional()
  @IsEnum(FullnessLevel)
  hunger_after?: FullnessLevel;

  @ApiProperty({ 
    description: 'Ingredient substitutions made',
    required: false
  })
  @IsOptional()
  @IsArray()
  substitutions?: any[];

  @ApiProperty({ 
    description: 'Meal notes',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
