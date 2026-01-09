import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { typeOrmConfig } from './config/typeorm.config';
import { createWinstonLogger } from './config/logger.config';
import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { MentorSlotsModule } from './modules/mentorSlots/slots/mentor-slots.module';
import { BookingModule } from './modules/bookings/booking.module';
import { CommunityForumsModule } from './modules/communityForums/community-forums.module';
import { PlansModule } from './modules/plans/plans.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(createWinstonLogger()),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    UsersModule,
    AuthModule,
    MentorSlotsModule,
    BookingModule,
    CommunityForumsModule,
    PlansModule,
    DashboardModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
