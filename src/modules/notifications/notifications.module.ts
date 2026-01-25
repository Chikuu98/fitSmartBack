import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { User } from '@/core/users/user.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AppLoggerService } from '@/common/services/app-logger.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  providers: [NotificationsService, AppLoggerService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
