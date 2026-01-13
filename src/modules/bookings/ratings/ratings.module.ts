import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { Rating } from './rating.entity';
import { Booking } from '../booking.entity';
import { AppLoggerService } from '@/common/services/app-logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Booking])],
  controllers: [RatingsController],
  providers: [RatingsService, AppLoggerService],
  exports: [RatingsService],
})
export class RatingsModule {}
