import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentorTimeSlot } from './mentor_time_slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';

@Injectable()
export class MentorSlotsService {
  constructor(
    @InjectRepository(MentorTimeSlot)
    private timeSlotRepo: Repository<MentorTimeSlot>,
  ) {}

  async createSlot(dto: CreateSlotDto, mentor_id: number) {
    const slot = this.timeSlotRepo.create({
      ...dto,
      mentor: { id: mentor_id },
    });
    await this.timeSlotRepo.save(slot);
    return {
      message: 'Time Slot Added successfully',
      success: true,
    };
  }

  async updateSlot(slotId: number, dto: UpdateSlotDto, mentor_id: number) {
    const slot = await this.timeSlotRepo.findOne({
      where: { id: slotId, mentor: { id: mentor_id } },
    });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    slot.start_time = dto.start_time;
    slot.end_time = dto.end_time;
    slot.is_booked = dto.is_booked;
    await this.timeSlotRepo.save(slot);
    return {
      message: 'Time Slot Updated successfully',
      success: true,
    };
  }

  async getMentorSlots(mentor_id: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [slots, total] = await this.timeSlotRepo.findAndCount({
      where: { mentor: { id: mentor_id }, is_booked: false },
      order: { date: 'ASC', start_time: 'ASC' },
      skip,
      take: limit,
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data: slots,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getSlotById(slotId: number) {
    const slot = await this.timeSlotRepo.findOne({ where: { id: slotId } });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    return {
      success: true,
      data: slot,
    };
  }

  async deleteSlot(id: number) {
    const result = await this.timeSlotRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Slot not found');
    }
    return {
      message: 'Time Slot Deleted successfully',
      success: true,
    };
  }
}
