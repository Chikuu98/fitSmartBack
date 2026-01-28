import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { MentorSlotsService } from './mentor-slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
    const mentor_id = req.user.user_id;
    return this.mentorSlotService.createSlot(dto, mentor_id);
  }

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Update a mentor slot' })
  @Post(':slotId')
  async updateSlot(
    @Param('slotId') slotId: number,
    @Body() dto: UpdateSlotDto,
    @Req() req: any,
  ) {
    const mentor_id = req.user.user_id;
    return this.mentorSlotService.updateSlot(slotId, dto, mentor_id);
  }

  @Get('mentor/:mentor_id')
  @ApiOperation({ summary: 'Get all slots for a mentor' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  async getMentorSlots(
    @Param('mentor_id') mentor_id: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.mentorSlotService.getMentorSlots(mentor_id, Number(page) || 1, Number(limit) || 10);
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
