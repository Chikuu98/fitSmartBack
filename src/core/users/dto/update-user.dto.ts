import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Gender } from '@/core/users/user.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @ApiPropertyOptional({
    example: 'John Smith',
    description: 'User name',
  })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({
    example: 'john.updated@example.com',
    description: 'User email address',
  })
  email?: string;

  @IsOptional()
  @IsEnum(Gender)
  @ApiPropertyOptional({
    enum: ['male', 'female', 'other'],
    description: 'User gender',
  })
  gender?: Gender;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @ApiPropertyOptional({
    example: 'Sri Lanka',
    description: 'User country',
  })
  country?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @ApiPropertyOptional({
    example: 'English',
    description: 'User preferred language',
  })
  language?: string;
}
