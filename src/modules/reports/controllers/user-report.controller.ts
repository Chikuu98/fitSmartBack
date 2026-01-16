import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/users/user.entity';
import { UserReportService } from '../services/user-report.service';
import { CreateUserReportDto, ReviewUserReportDto, ApplyPunishmentDto } from '../dto/user-report.dto';
import { ReportStatus } from '../entities/user-report.entity';

@Controller('user-reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserReportController {
  constructor(private readonly reportService: UserReportService) {}

  @Post()
  @Roles(UserRole.MEMBER, UserRole.MENTOR)
  async create(@Body() dto: CreateUserReportDto, @Request() req: any) {
    return this.reportService.create(dto, req.user.user_id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: ReportStatus,
  ) {
    return this.reportService.findAll(page, limit, status);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  async getStats() {
    return this.reportService.getReportStats();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportService.findOne(id);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN)
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewUserReportDto,
    @Request() req: any,
  ) {
    return this.reportService.review(id, dto, req.user.user_id);
  }

  @Post(':id/apply-punishment')
  @Roles(UserRole.ADMIN)
  async applyPunishment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApplyPunishmentDto,
    @Request() req: any,
  ) {
    return this.reportService.applyPunishment(id, dto, req.user.user_id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.reportService.delete(id, req.user.user_id);
  }

  @Get('punishments/user/:userId')
  @Roles(UserRole.ADMIN)
  async getUserPunishments(@Param('userId', ParseIntPipe) userId: number) {
    return this.reportService.getUserPunishments(userId);
  }

  @Patch('punishments/:id/lift')
  @Roles(UserRole.ADMIN)
  async liftPunishment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.reportService.liftPunishment(id, req.user.user_id);
  }
}
