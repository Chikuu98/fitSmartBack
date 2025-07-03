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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/users/user.entity';
import { UpdateSlotDto } from './dto/update-slot.dto';
@ApiTags('Mentor Slots')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('mentor-slots')
export class MentorSlotsController {
  constructor(private readonly mentorSlotService: MentorSlotsService) {}

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Create a new mentor slot' })
  @Post()
  async createSlot(@Body() dto: CreateSlotDto, @Req() req) {
    const mentorId = req.user.userId;
    return this.mentorSlotService.createSlot(dto, mentorId);
  }

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Update a mentor slot' })
  @Post(':slotId')
  async updateSlot(
    @Param('slotId') slotId: number,
    @Body() dto: UpdateSlotDto,
    @Req() req: any,
  ) {
    const mentorId = req.user.userId;
    return this.mentorSlotService.updateSlot(slotId, dto, mentorId);
  }

  @Get('mentor/:mentorId')
  @ApiOperation({ summary: 'Get all slots for a mentor' })
  async getMentorSlots(@Param('mentorId') mentorId: number) {
    return this.mentorSlotService.getMentorSlots(mentorId);
  }

  @Get(':slotId')
  @ApiOperation({ summary: 'Get a slot by ID' })
  async getSlotById(@Param('slotId') slotId: number) {
    return this.mentorSlotService.getSlotById(slotId);
  }

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Delete a mentor slot' })
  @Delete(':slotId')
  async deleteSlot(@Param('slotId') slotId: number) {
    return this.mentorSlotService.deleteSlot(slotId);
  }
}
