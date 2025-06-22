import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MentorSlotsService } from './mentor-slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User, UserRole } from 'src/core/users/user.entity';

@ApiTags('Mentor Slots')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('mentor-slots')
export class MentorSlotsController {
  constructor(private readonly mentorSlotService: MentorSlotsService) {}

  @Post()
  async createSlot(@Body() dto: CreateSlotDto, @Req() req) {
    const mentorId = req.user.userId;
    return this.mentorSlotService.createSlot(dto, mentorId);
  }

  @Get('mentor/:mentorId')
  async getMentorSlots(@Param('mentorId') mentorId: number) {
    return this.mentorSlotService.getMentorSlots(mentorId);
  }

  @Get(':slotId')
  async getSlotById(@Param('slotId') slotId: number) {
    return this.mentorSlotService.getSlotById(slotId);
  }

  @Roles(UserRole.MENTOR)
  @Post(':slotId/book')
  async bookSlot(@Param('slotId') slotId: number) {
    return this.mentorSlotService.bookSlot(slotId);
  }

  @Roles(UserRole.MENTOR)
  @Delete(':slotId')
  async deleteSlot(@Param('slotId') slotId: number) {
    await this.mentorSlotService.deleteSlot(slotId);
    return { message: 'Slot deleted successfully' };
  }
}
