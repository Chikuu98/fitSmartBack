import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCertificationDto {

  @ApiProperty({ description: 'Title of the certification' })
  @IsString()
  @IsNotEmpty()
  title: string;


  @ApiProperty({ description: 'Issuer of the certification' })
  @IsString()
  @IsNotEmpty()
  issuer: string;

  @ApiPropertyOptional({ description: 'Date the certification was issued', type: String, format: 'date' })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'issue_date must be a valid date string (YYYY-MM-DD)' })
  issue_date?: string;
}
