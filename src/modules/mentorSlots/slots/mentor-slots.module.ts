import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorTimeSlot } from './mentor_time_slot.entity';
import { MentorSlotsController } from './mentor-slots.controller';
import { MentorSlotsService } from './mentor-slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([MentorTimeSlot])],
  controllers: [MentorSlotsController],
  providers: [MentorSlotsService],
  exports: [MentorSlotsService],
})
export class MentorSlotsModule {}
