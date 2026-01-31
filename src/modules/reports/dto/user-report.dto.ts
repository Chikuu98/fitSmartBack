import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ReportType, ReportStatus, ReportedContentType } from '../entities/user-report.entity';
import { PunishmentType } from '../entities/user-punishment.entity';

export class CreateUserReportDto {
  @IsEnum(ReportType)
  @IsNotEmpty()
  report_type: ReportType;

  @IsEnum(ReportedContentType)
  @IsNotEmpty()
  reported_content_type: ReportedContentType;

  @IsNumber()
  @IsNotEmpty()
  reported_content_id: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  evidence?: string;
}

export class ReviewUserReportDto {
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;

  @IsString()
  @IsOptional()
  review_notes?: string;
}

export class ApplyPunishmentDto {
  @IsEnum(PunishmentType)
  @IsNotEmpty()
  punishment_type: PunishmentType;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  admin_notes?: string;

  @IsDateString()
  @IsOptional()
  expires_at?: string;
}
