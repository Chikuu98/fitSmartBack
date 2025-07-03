import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCertificationDto {
  @ApiPropertyOptional({ description: 'Title of the certification' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Issuer of the certification' })
  @IsOptional()
  @IsString()
  issuer?: string;

  @ApiPropertyOptional({ description: 'Date the certification was issued', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  issue_date?: string;
}
