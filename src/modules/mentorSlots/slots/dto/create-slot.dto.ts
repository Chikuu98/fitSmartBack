import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateSlotDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ type: String, format: 'date', example: '2023-10-01' })
  date: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, format: 'time', example: '09:00:00' })
  start_time: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, format: 'time', example: '09:00:00' })
  end_time: string;
}
