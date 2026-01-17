import { IsString, IsOptional, IsNumber, IsObject, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to receive the notification' })
  @IsNumber()
  userId: number;

  @ApiProperty({ enum: NotificationType, description: 'Type of notification' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message content' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Additional data related to notification' })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({ description: 'URL to navigate when notification is clicked' })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'When the notification expires' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}
