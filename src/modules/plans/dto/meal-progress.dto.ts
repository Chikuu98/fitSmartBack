import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { MealStatus } from '../entities/meal-progress.entity';

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
    description: 'General notes about the meal consumption',
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
    description: 'General notes about the meal consumption',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
