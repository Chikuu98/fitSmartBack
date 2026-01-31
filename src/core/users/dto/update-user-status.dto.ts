import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserAccountStatus } from '../user.entity';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'New status for the user account',
    enum: UserAccountStatus,
  })
  @IsEnum(UserAccountStatus)
  @IsNotEmpty()
  status: UserAccountStatus;

  @ApiProperty({
    description: 'Optional reason/note for status change',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
