import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { MentorSlotsModule } from './modules/mentorSlots/slots/mentor-slots.module';
import { BookingModule } from './modules/bookings/booking.module';
import { CommunityForumsModule } from './modules/communityForums/community-forums.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
