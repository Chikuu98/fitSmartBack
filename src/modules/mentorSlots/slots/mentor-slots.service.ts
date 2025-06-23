import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentorTimeSlot } from './mentor_time_slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class MentorSlotsService {
  constructor(
    @InjectRepository(MentorTimeSlot)
    private timeSlotRepo: Repository<MentorTimeSlot>,
  ) {}

  async createSlot(
    dto: CreateSlotDto,
    mentorId: number,
  ): Promise<MentorTimeSlot> {
    const slot = this.timeSlotRepo.create({
      ...dto,
      mentor: { id: mentorId },
    });
    return await this.timeSlotRepo.save(slot);
  }

  async getMentorSlots(mentorId: number): Promise<MentorTimeSlot[]> {
    return await this.timeSlotRepo.find({
      where: { mentor: { id: mentorId }, is_booked: false },
    });
  }

  async getSlotById(slotId: number): Promise<MentorTimeSlot> {
    const slot = await this.timeSlotRepo.findOne({ where: { id: slotId } });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    return slot;
  }

  async deleteSlot(id: number): Promise<void> {
    const result = await this.timeSlotRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Slot not found');
    }
  }
}
