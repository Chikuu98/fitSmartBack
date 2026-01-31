import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class GenerateReportDto {
  @ApiProperty({
    enum: ReportPeriod,
    description: 'Report period type',
    example: ReportPeriod.WEEKLY,
  })
  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @ApiPropertyOptional({
    description: 'Start date for the report (ISO format)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for the report (ISO format)',
    example: '2026-01-07',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Accepted plan ID to filter report data',
    example: 1,
  })
  @IsOptional()
  acceptedPlanId?: number;
}
