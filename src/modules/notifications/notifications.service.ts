import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '@/core/users/user.entity';
import { AppLoggerService } from '@/common/services/app-logger.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('NotificationsService');
  }

  async create(dto: CreateNotificationDto): Promise<Notification | null> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      this.logger.warn(`User ${dto.userId} not found for notification`);
      return null;
    }

    const notification = this.notificationRepository.create({
      user,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data || null,
      action_url: dto.actionUrl || null,
      expires_at: dto.expiresAt || null,
      is_read: false,
    } as Partial<Notification>);

    const saved = await this.notificationRepository.save(notification);
    this.logger.log(`Notification created for user ${dto.userId}: ${dto.type}`);
    return saved as Notification;
  }

  async notifyBookingAccepted(
    memberId: number,
    mentorName: string,
    bookingId: number,
    meetLink: string,
  ): Promise<Notification | null> {
    return this.create({
      userId: memberId,
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Booking Confirmed!',
      message: `Your booking with ${mentorName} has been accepted. Join the session using the provided Google Meet link.`,
      data: { bookingId, meetLink },
      actionUrl: '/member/my-bookings',
    });
  }

  async notifyBookingCancelled(
    userId: number,
    cancelledBy: string,
    bookingId: number,
  ): Promise<Notification | null> {
    return this.create({
      userId,
      type: NotificationType.BOOKING_CANCELLED,
      title: 'Booking Cancelled',
      message: `Your booking has been cancelled by ${cancelledBy}.`,
      data: { bookingId },
      actionUrl: '/member/my-bookings',
    });
  }

  async notifyNewBookingRequest(
    mentorId: number,
    memberName: string,
    bookingId: number,
  ): Promise<Notification | null> {
    return this.create({
      userId: mentorId,
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'New Booking Request',
      message: `You have a new booking request from ${memberName}. Please review and accept or reject.`,
      data: { bookingId },
      actionUrl: '/mentor/my-bookings',
    });
  }

  async notifyForumReply(
    threadOwnerId: number,
    replierName: string,
    threadId: number,
    threadTitle: string,
  ): Promise<Notification | null> {
    return this.create({
      userId: threadOwnerId,
      type: NotificationType.FORUM_REPLY,
      title: 'New Reply on Your Thread',
      message: `${replierName} replied to your thread "${threadTitle.substring(0, 50)}${threadTitle.length > 50 ? '...' : ''}"`,
      data: { threadId },
      actionUrl: `/community-forum/thread/${threadId}`,
    });
  }

  async notifyForumLike(
    contentOwnerId: number,
    likerName: string,
    contentType: 'thread' | 'reply',
    contentId: number,
    threadId: number,
  ): Promise<Notification | null> {
    return this.create({
      userId: contentOwnerId,
      type: NotificationType.FORUM_LIKE,
      title: `New Like on Your ${contentType === 'thread' ? 'Thread' : 'Reply'}`,
      message: `${likerName} liked your ${contentType}.`,
      data: { contentType, contentId, threadId },
      actionUrl: `/community-forum/thread/${threadId}`,
    });
  }

  async notifyPlanGenerated(
    userId: number,
    planId: number,
    planName: string,
  ): Promise<Notification | null> {
    return this.create({
      userId,
      type: NotificationType.PLAN_GENERATED,
      title: 'Your Fitness Plan is Ready!',
      message: `Your personalized fitness plan "${planName}" has been generated and is ready for review.`,
      data: { planId },
      actionUrl: '/member/my-plans',
    });
  }

  async notifyNewRating(
    mentorId: number,
    memberName: string,
    rating: number,
    bookingId: number,
  ): Promise<Notification | null> {
    return this.create({
      userId: mentorId,
      type: NotificationType.MENTOR_MESSAGE,
      title: 'New Rating Received',
      message: `${memberName} gave you a ${rating}-star rating for your session.`,
      data: { bookingId, rating },
      actionUrl: '/mentor/my-bookings',
    });
  }

  async findByUser(userId: number, page = 1, limit = 20) {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: userId }, is_read: false },
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      return { success: false, message: 'Notification not found' };
    }

    notification.is_read = true;
    notification.read_at = new Date();
    await this.notificationRepository.save(notification);

    return { success: true, message: 'Notification marked as read', noToast: true };
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepository.update(
      { user: { id: userId }, is_read: false },
      { is_read: true, read_at: new Date() },
    );

    return { success: true, message: 'All notifications marked as read', noToast: true };
  }

  async delete(notificationId: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      return { success: false, message: 'Notification not found' };
    }

    await this.notificationRepository.remove(notification);
    return { success: true, message: 'Notification deleted', noToast: true };
  }

  async cleanupOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository.delete({
      is_read: true,
      created_at: LessThan(cutoffDate),
    });

    this.logger.log(`Cleaned up ${result.affected} old notifications`);
    return { success: true, message: `Deleted ${result.affected} old notifications` };
  }
}
