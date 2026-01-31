import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReport, ReportStatus, ReportedContentType } from '../entities/user-report.entity';
import { UserPunishment, PunishmentType } from '../entities/user-punishment.entity';
import { User, UserAccountStatus } from '@/core/users/user.entity';
import { ForumThread } from '@/modules/communityForums/entities/forum-thread.entity';
import { ForumReply } from '@/modules/communityForums/entities/forum-reply.entity';
import { CreateUserReportDto, ReviewUserReportDto, ApplyPunishmentDto } from '../dto/user-report.dto';
import { AppLoggerService } from '@/common/services/app-logger.service';

@Injectable()
export class UserReportService {
  constructor(
    @InjectRepository(UserReport)
    private readonly reportRepo: Repository<UserReport>,
    @InjectRepository(UserPunishment)
    private readonly punishmentRepo: Repository<UserPunishment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ForumThread)
    private readonly threadRepo: Repository<ForumThread>,
    @InjectRepository(ForumReply)
    private readonly replyRepo: Repository<ForumReply>,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('UserReportService');
  }

  async create(dto: CreateUserReportDto, reporterId: number): Promise<any> {
    const reporter = await this.userRepo.findOne({ where: { id: reporterId } });
    if (!reporter) {
      throw new NotFoundException('Reporter user not found');
    }

    let reportedUserId: number;

    if (dto.reported_content_type === ReportedContentType.FORUM_THREAD) {
      const thread = await this.threadRepo.findOne({
        where: { id: dto.reported_content_id },
        relations: ['user'],
      });

      if (!thread) {
        throw new NotFoundException('Thread not found');
      }

      reportedUserId = thread.user_id;
    } else if (dto.reported_content_type === ReportedContentType.FORUM_REPLY) {
      const reply = await this.replyRepo.findOne({
        where: { id: dto.reported_content_id },
        relations: ['user'],
      });

      if (!reply) {
        throw new NotFoundException('Reply not found');
      }

      reportedUserId = reply.user_id;
    } else {
      reportedUserId = dto.reported_content_id;
    }

    if (reporterId === reportedUserId) {
      throw new BadRequestException('You cannot report your own content');
    }

    const reportedUser = await this.userRepo.findOne({ where: { id: reportedUserId } });
    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    const existingReport = await this.reportRepo.findOne({
      where: {
        reporter,
        reported_content_type: dto.reported_content_type,
        reported_content_id: dto.reported_content_id,
        status: ReportStatus.PENDING,
      },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this content and it is under review');
    }

    const report = this.reportRepo.create({
      reporter,
      reported_user: reportedUser,
      report_type: dto.report_type,
      reported_content_type: dto.reported_content_type,
      reported_content_id: dto.reported_content_id,
      reason: dto.reason,
      evidence: dto.evidence,
      status: ReportStatus.PENDING,
    });

    const savedReport = await this.reportRepo.save(report);

    this.logger.log(
      `User ${reporterId} reported ${dto.reported_content_type} ID ${dto.reported_content_id} by user ${reportedUserId}`,
    );

    return {
      success: true,
      message: 'Report submitted successfully. Admin will review it shortly.',
      data: savedReport,
    };
  }

  async findAll(page: number = 1, limit: number = 10, status?: ReportStatus): Promise<any> {
    const queryBuilder = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.reported_user', 'reportedUser')
      .leftJoinAndSelect('report.reviewed_by', 'reviewedBy')
      .orderBy('report.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();

    const reportsWithContent = await Promise.all(
      reports.map(async (report) => {
        let contentDetails: any = null;

        if (report.reported_content_type === ReportedContentType.FORUM_THREAD) {
          const thread = await this.threadRepo.findOne({
            where: { id: report.reported_content_id },
            relations: ['user'],
          });
          contentDetails = thread ? {
            title: thread.title,
            content: thread.content,
            author: thread.user?.name,
          } : null;
        } else if (report.reported_content_type === ReportedContentType.FORUM_REPLY) {
          const reply = await this.replyRepo.findOne({
            where: { id: report.reported_content_id },
            relations: ['user', 'thread'],
          });
          contentDetails = reply ? {
            content: reply.content,
            author: reply.user?.name,
            threadTitle: reply.thread?.title,
          } : null;
        }

        return {
          ...report,
          contentDetails,
        };
      }),
    );

    return {
      success: true,
      message: 'Reports retrieved successfully',
      data: reportsWithContent,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<any> {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['reporter', 'reported_user', 'reviewed_by'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    let contentDetails: any = null;
    if (report.reported_content_type === ReportedContentType.FORUM_THREAD) {
      const thread = await this.threadRepo.findOne({
        where: { id: report.reported_content_id },
        relations: ['user', 'forumType'],
      });
      contentDetails = thread;
    } else if (report.reported_content_type === ReportedContentType.FORUM_REPLY) {
      const reply = await this.replyRepo.findOne({
        where: { id: report.reported_content_id },
        relations: ['user', 'thread'],
      });
      contentDetails = reply;
    }

    return {
      success: true,
      message: 'Report retrieved successfully',
      data: {
        ...report,
        contentDetails,
      },
    };
  }

  async review(id: number, dto: ReviewUserReportDto, adminId: number): Promise<any> {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['reported_user'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    report.status = dto.status;
    report.review_notes = dto.review_notes ?? '';
    report.reviewed_by = admin;
    report.reviewed_at = new Date();

    const updatedReport = await this.reportRepo.save(report);

    this.logger.log(`Admin ${adminId} reviewed report ${id} with status: ${dto.status}`);

    return {
      success: true,
      message: 'Report reviewed successfully',
      data: updatedReport,
    };
  }

  async applyPunishment(reportId: number, dto: ApplyPunishmentDto, adminId: number): Promise<any> {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
      relations: ['reported_user'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    const reportedUser = report.reported_user;

    const punishment = this.punishmentRepo.create({
      user: reportedUser,
      punishment_type: dto.punishment_type,
      reason: dto.reason,
      admin_notes: dto.admin_notes,
      issued_by: admin,
      related_report_id: reportId,
      expires_at: dto.expires_at ? new Date(dto.expires_at) : undefined,
      is_active: true,
    });

    const savedPunishment = await this.punishmentRepo.save(punishment);

    await this.updateUserStatus(reportedUser.id, dto.punishment_type, dto.expires_at);

    report.status = ReportStatus.RESOLVED;
    report.review_notes = `Punishment applied: ${dto.punishment_type}. ${dto.admin_notes || ''}`;
    report.reviewed_by = admin;
    report.reviewed_at = new Date();
    await this.reportRepo.save(report);

    this.logger.log(
      `Admin ${adminId} applied punishment ${dto.punishment_type} to user ${reportedUser.id} for report ${reportId}`,
    );

    return {
      success: true,
      message: 'Punishment applied successfully',
      data: {
        punishment: savedPunishment,
        report,
      },
    };
  }

  private async updateUserStatus(
    userId: number,
    punishmentType: PunishmentType,
    expiresAt?: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return;
    }

    switch (punishmentType) {
      case PunishmentType.TEMPORARY_SUSPENSION:
        user.status = UserAccountStatus.SUSPENDED;
        this.logger.log(`User ${userId} temporarily suspended until ${expiresAt}`);
        break;

      case PunishmentType.PERMANENT_BAN:
        user.status = UserAccountStatus.BANNED;
        this.logger.log(`User ${userId} permanently banned`);
        break;

      case PunishmentType.WARNING:
        this.logger.log(`User ${userId} received a warning`);
        break;

      case PunishmentType.FORUM_RESTRICTION:
        this.logger.log(`User ${userId} restricted from forums`);
        break;

      case PunishmentType.CONTENT_REMOVAL:
        this.logger.log(`Content from user ${userId} marked for removal`);
        break;

      default:
        break;
    }

    if (
      punishmentType === PunishmentType.TEMPORARY_SUSPENSION ||
      punishmentType === PunishmentType.PERMANENT_BAN
    ) {
      await this.userRepo.save(user);
    }
  }

  async delete(id: number, adminId: number): Promise<any> {
    const report = await this.reportRepo.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    await this.reportRepo.remove(report);

    this.logger.log(`Admin ${adminId} deleted report ${id}`);

    return {
      success: true,
      message: 'Report deleted successfully',
      data: null,
    };
  }

  async getReportStats(): Promise<any> {
    const totalReports = await this.reportRepo.count();
    const pendingReports = await this.reportRepo.count({
      where: { status: ReportStatus.PENDING },
    });
    const underReviewReports = await this.reportRepo.count({
      where: { status: ReportStatus.UNDER_REVIEW },
    });
    const resolvedReports = await this.reportRepo.count({
      where: { status: ReportStatus.RESOLVED },
    });
    const dismissedReports = await this.reportRepo.count({
      where: { status: ReportStatus.DISMISSED },
    });

    return {
      success: true,
      message: 'Report statistics retrieved successfully',
      data: {
        total: totalReports,
        pending: pendingReports,
        underReview: underReviewReports,
        resolved: resolvedReports,
        dismissed: dismissedReports,
      },
    };
  }

  async getUserPunishments(userId: number): Promise<any> {
    const punishments = await this.punishmentRepo.find({
      where: { user: { id: userId } },
      relations: ['issued_by', 'lifted_by'],
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      message: 'User punishments retrieved successfully',
      data: punishments,
    };
  }

  async liftPunishment(punishmentId: number, adminId: number): Promise<any> {
    const punishment = await this.punishmentRepo.findOne({
      where: { id: punishmentId },
      relations: ['user'],
    });

    if (!punishment) {
      throw new NotFoundException('Punishment not found');
    }

    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    punishment.is_active = false;
    punishment.ended_at = new Date();
    punishment.lifted_by = admin;

    await this.punishmentRepo.save(punishment);

    const activePunishments = await this.punishmentRepo.count({
      where: {
        user: { id: punishment.user.id },
        is_active: true,
      },
    });

    if (activePunishments === 0) {
      const user = await this.userRepo.findOne({ where: { id: punishment.user.id } });
      if (user && user.status !== UserAccountStatus.ACTIVE) {
        user.status = UserAccountStatus.ACTIVE;
        await this.userRepo.save(user);
        this.logger.log(`User ${user.id} status restored to ACTIVE`);
      }
    }

    this.logger.log(`Admin ${adminId} lifted punishment ${punishmentId}`);

    return {
      success: true,
      message: 'Punishment lifted successfully',
      data: punishment,
    };
  }
}
