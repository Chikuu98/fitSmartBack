import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/core/users/user.entity';
import { DashboardService } from './dashboard.service';
import { MemberDashboardResponseDto } from './dto/member-dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('member')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ 
    summary: 'Get member dashboard data',
    description: 'Retrieve comprehensive dashboard data for a member including sessions, forum activity, plans, and recent activities in a single request'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard data retrieved successfully',
    type: MemberDashboardResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Authentication required' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Only members can access this endpoint' 
  })
  async getMemberDashboard(@Request() req): Promise<MemberDashboardResponseDto> {
    return this.dashboardService.getMemberDashboard(req.user.user_id);
  }
}
