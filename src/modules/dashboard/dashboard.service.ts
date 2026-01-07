import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '@/core/users/user.entity';
import { Booking, BookingStatus } from '../bookings/booking.entity';
import { ForumThread } from '../communityForums/entities/forum-thread.entity';
import { AcceptedPlan, AcceptedPlanStatus } from '../plans/entities/accepted-plan.entity';
import { DailyProgress } from '../plans/entities/daily-progress.entity';
import { WorkoutProgress } from '../plans/entities/workout-progress.entity';
import { MealProgress } from '../plans/entities/meal-progress.entity';
import {
  MemberDashboardResponseDto,
  MemberDashboardData,
  SessionStats,
  ForumStats,
  PlanStats,
  RecentForumThread,
  ActivePlanData,
  RecentActivity,
  UpcomingBooking,
  RecentBooking,
} from './dto/member-dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(ForumThread)
    private forumThreadRepository: Repository<ForumThread>,
    @InjectRepository(AcceptedPlan)
    private acceptedPlanRepository: Repository<AcceptedPlan>,
    @InjectRepository(DailyProgress)
    private dailyProgressRepository: Repository<DailyProgress>,
    @InjectRepository(WorkoutProgress)
    private workoutProgressRepository: Repository<WorkoutProgress>,
    @InjectRepository(MealProgress)
    private mealProgressRepository: Repository<MealProgress>,
  ) {}

  async getMemberDashboard(userId: number): Promise<MemberDashboardResponseDto> {
    try {
      this.logger.log(`Fetching dashboard data for user ID: ${userId}`);

      // Fetch all data in parallel for better performance
      const [
        sessionStats,
        forumStats,
        { planStats, activePlans, recentActivities },
        recentForumThreads,
        upcomingBookings,
        recentBookings,
      ] = await Promise.all([
        this.getSessionStats(userId),
        this.getForumStats(userId),
        this.getPlanStatsAndData(userId),
        this.getRecentForumThreads(userId),
        this.getUpcomingBookings(userId),
        this.getRecentBookings(userId),
      ]);

      return {
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          sessionStats,
          forumStats,
          planStats,
          recentForumThreads,
          activePlans,
          recentActivities,
          upcomingBookings,
          recentBookings,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching dashboard data: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getSessionStats(userId: number): Promise<SessionStats> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        totalSessions: 0,
        upcomingSessions: 0,
        pendingBookings: 0,
        totalBookings: 0,
      };
    }
    
    const bookings = await this.bookingRepository.find({
      where: { member: { id: userId } },
      relations: ['mentorSlot'],
    });

    const now = new Date();

    return {
      totalSessions: bookings.filter((b) => b.status === BookingStatus.COMPLETED).length,
      upcomingSessions: bookings.filter(
        (b) =>
          b.status === BookingStatus.ACCEPTED &&
          b.mentorSlot?.date &&
          new Date(b.mentorSlot.date) >= now,
      ).length,
      pendingBookings: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
      totalBookings: bookings.length,
    };
  }

  private async getForumStats(userId: number): Promise<ForumStats> {
    const threads = await this.forumThreadRepository.find({
      where: { user_id: userId },
      relations: ['replies', 'likes'],
    });

    // Calculate total replies and likes
    const repliesMade = threads.reduce((sum, thread) => sum + (thread.replies?.length || 0), 0);
    const likesReceived = threads.reduce((sum, thread) => sum + (thread.likes?.length || 0), 0);

    return {
      threadsCreated: threads.length,
      repliesMade,
      likesReceived,
      helpfulVotes: likesReceived, // Using likes as helpful votes
    };
  }

  private async getPlanStatsAndData(
    userId: number,
  ): Promise<{
    planStats: PlanStats;
    activePlans: ActivePlanData[];
    recentActivities: RecentActivity[];
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        planStats: {
          activeWorkoutPlan: false,
          activeMealPlan: false,
          workoutCompletionRate: 0,
          mealPlanAdherence: 0,
          totalWorkoutsCompleted: 0,
          currentStreak: 0,
        },
        activePlans: [],
        recentActivities: [],
      };
    }

    // Get all active plans
    const activePlans = await this.acceptedPlanRepository.find({
      where: {
        user: { id: userId },
        status: AcceptedPlanStatus.ACTIVE,
      },
    });

    this.logger.log(`Found ${activePlans.length} active plans for user ${userId}`);
    if (activePlans.length > 0) {
      activePlans.forEach(plan => {
        this.logger.log(`Plan: ${plan.plan_name}, Goal: ${plan.target_goal}`);
      });
    }

    // If no active plans found, return empty data
    if (activePlans.length === 0) {
      return {
        planStats: {
          activeWorkoutPlan: false,
          activeMealPlan: false,
          workoutCompletionRate: 0,
          mealPlanAdherence: 0,
          totalWorkoutsCompleted: 0,
          currentStreak: 0,
        },
        activePlans: [],
        recentActivities: [],
      };
    }

    // Get recent activities to help identify plan types
    const recentProgress = await this.dailyProgressRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['acceptedPlan'],
      order: { progress_date: 'DESC' },
      take: 10,
    });

    // Check which plans have actual workout/meal progress data
    const planProgressTypes = await Promise.all(
      activePlans.map(async (plan) => {
        const hasWorkoutProgress = await this.workoutProgressRepository.count({
          where: {
            dailyProgress: {
              acceptedPlan: { id: plan.id },
              user: { id: userId },
            },
          },
        });

        const hasMealProgress = await this.mealProgressRepository.count({
          where: {
            dailyProgress: {
              acceptedPlan: { id: plan.id },
              user: { id: userId },
            },
          },
        });

        return {
          plan,
          hasWorkout: hasWorkoutProgress > 0,
          hasMeal: hasMealProgress > 0,
        };
      }),
    );

    this.logger.log('Plan progress types:', JSON.stringify(planProgressTypes.map(p => ({
      planId: p.plan.id,
      planName: p.plan.plan_name,
      hasWorkout: p.hasWorkout,
      hasMeal: p.hasMeal
    }))));

    // Identify workout and meal plans based on actual progress data
    // A plan can be BOTH if it has both types of progress (combined plan)
    const workoutPlan = planProgressTypes.find(p => p.hasWorkout)?.plan;
    const mealPlan = planProgressTypes.find(p => p.hasMeal)?.plan;
    
    // Check if it's a combined plan (same plan has both workout and meal)
    const isCombinedPlan = workoutPlan && mealPlan && workoutPlan.id === mealPlan.id;

    let finalWorkoutPlan = workoutPlan;
    let finalMealPlan = mealPlan;

    // Fetch progress data for identified plans
    // For combined plans, calculate workout and meal progress separately
    const workoutProgress = finalWorkoutPlan
      ? await this.calculatePlanProgress(finalWorkoutPlan, user, 'workout')
      : null;
    const mealProgress = finalMealPlan 
      ? await this.calculatePlanProgress(finalMealPlan, user, 'meal') 
      : null;

    this.logger.log(`Workout Plan: ${finalWorkoutPlan ? finalWorkoutPlan.plan_name : 'Not found'}, Meal Plan: ${finalMealPlan ? finalMealPlan.plan_name : 'Not found'}, Combined: ${isCombinedPlan}`);
    this.logger.log(`Workout Progress: ${JSON.stringify(workoutProgress)}, Meal Progress: ${JSON.stringify(mealProgress)}`);

    // Calculate plan stats
    const planStats: PlanStats = {
      activeWorkoutPlan: !!finalWorkoutPlan,
      activeMealPlan: !!finalMealPlan,
      workoutCompletionRate: workoutProgress?.completionRate || 0,
      mealPlanAdherence: mealProgress?.completionRate || 0,
      totalWorkoutsCompleted: workoutProgress?.completedDays || 0,
      currentStreak: Math.max(
        workoutProgress?.currentStreak || 0,
        mealProgress?.currentStreak || 0,
      ),
    };

    // Build active plans data
    const activePlansData: ActivePlanData[] = [];
    if (finalWorkoutPlan && workoutProgress) {
      activePlansData.push({
        id: finalWorkoutPlan.id,
        type: 'Workout',
        name: finalWorkoutPlan.plan_name,
        progress: workoutProgress.completionRate,
        daysCompleted: workoutProgress.completedDays,
        totalDays: workoutProgress.totalDays,
        planStartDate: finalWorkoutPlan.start_date?.toString() || '',
        planEndDate: finalWorkoutPlan.end_date?.toString() || '',
      });
    }
    if (finalMealPlan && mealProgress) {
      activePlansData.push({
        id: finalMealPlan.id,
        type: 'Meal',
        name: finalMealPlan.plan_name,
        progress: mealProgress.completionRate,
        daysCompleted: mealProgress.completedDays,
        totalDays: mealProgress.totalDays,
        planStartDate: finalMealPlan.start_date?.toString() || '',
        planEndDate: finalMealPlan.end_date?.toString() || '',
      });
    }

    // Get recent activities
    const recentActivities = await this.getRecentActivities(userId, activePlans);

    return {
      planStats,
      activePlans: activePlansData,
      recentActivities,
    };
  }

  private async calculatePlanProgress(
    plan: AcceptedPlan,
    user: User,
    progressType: 'workout' | 'meal',
  ): Promise<{ completionRate: number; completedDays: number; totalDays: number; currentStreak: number }> {
    const dailyProgress = await this.dailyProgressRepository.find({
      where: {
        acceptedPlan: { id: plan.id },
        user: { id: user.id },
      },
      relations: ['workoutProgress', 'mealProgress'],
      order: { progress_date: 'DESC' },
    });

    // Filter days that have the specific progress type
    const relevantDays = dailyProgress.filter(dp => {
      if (progressType === 'workout') {
        return dp.workoutProgress && dp.workoutProgress.length > 0;
      } else {
        return dp.mealProgress && dp.mealProgress.length > 0;
      }
    });

    // Calculate duration from start and end date
    let totalDays = 0;
    if (plan.start_date && plan.end_date) {
      const start = new Date(plan.start_date);
      const end = new Date(plan.end_date);
      totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    const completedDays = relevantDays.length;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    // Calculate current streak based on relevant progress type
    let currentStreak = 0;
    const sortedProgress = relevantDays.sort(
      (a, b) => new Date(b.progress_date).getTime() - new Date(a.progress_date).getTime(),
    );

    for (let i = 0; i < sortedProgress.length; i++) {
      const progressDate = new Date(sortedProgress[i].progress_date);
      const today = new Date();
      const daysDiff = Math.floor(
        (today.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (i === 0 && daysDiff <= 1) {
        currentStreak++;
      } else if (i > 0) {
        const prevDate = new Date(sortedProgress[i - 1].progress_date);
        const diffWithPrev = Math.floor(
          (prevDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffWithPrev === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      completionRate: Math.round(completionRate),
      completedDays,
      totalDays,
      currentStreak,
    };
  }

  private async getRecentActivities(
    userId: number,
    activePlans: AcceptedPlan[],
  ): Promise<RecentActivity[]> {
    if (activePlans.length === 0) return [];

    const recentProgress = await this.dailyProgressRepository.find({
      where: {
        user: { id: userId },
      },
      order: { progress_date: 'DESC' },
      take: 10,
      relations: ['acceptedPlan', 'workoutProgress', 'mealProgress'],
    });

    // Flatten progress into separate workout and meal activities
    const activities: RecentActivity[] = [];
    
    for (const progress of recentProgress) {
      // Add workout activity if has workout progress
      if (progress.workoutProgress && progress.workoutProgress.length > 0) {
        activities.push({
          id: `workout-${progress.id}`,
          type: 'workout',
          title: `Day ${progress.day_number} Workout`,
          completedAt: progress.progress_date.toString(),
          duration: undefined,
          calories: undefined,
        });
      }
      
      // Add meal activity if has meal progress
      if (progress.mealProgress && progress.mealProgress.length > 0) {
        activities.push({
          id: `meal-${progress.id}`,
          type: 'meal',
          title: `Day ${progress.day_number} Meal Plan`,
          completedAt: progress.progress_date.toString(),
          duration: undefined,
          calories: undefined,
        });
      }
    }

    // Return most recent 5 activities
    return activities.slice(0, 5);
  }

  private async getRecentForumThreads(userId: number): Promise<RecentForumThread[]> {
    const threads = await this.forumThreadRepository.find({
      where: { user_id: userId },
      relations: ['forumType', 'replies', 'likes'],
      order: { created_at: 'DESC' },
      take: 3,
    });

    return threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      type: thread.forumType?.title || 'General',
      replies: thread.replies?.length || 0,
      likes: thread.likes?.length || 0,
      createdAt: thread.created_at.toISOString(),
      author: 'You',
    }));
  }

  private async getUpcomingBookings(userId: number): Promise<UpcomingBooking[]> {
    const now = new Date();

    const bookings = await this.bookingRepository.find({
      where: {
        member: { id: userId },
        status: BookingStatus.ACCEPTED,
      },
      relations: ['mentorSlot', 'mentorSlot.mentor'],
      order: { created_at: 'DESC' },
    });

    const upcomingBookings = bookings
      .filter((b) => b.mentorSlot?.date && new Date(b.mentorSlot.date) >= now)
      .sort(
        (a, b) =>
          new Date(a.mentorSlot.date).getTime() - new Date(b.mentorSlot.date).getTime(),
      )
      .slice(0, 3);

    return upcomingBookings.map((booking) => ({
      id: booking.id,
      mentorName: booking.mentorSlot?.mentor?.name || 'Unknown Mentor',
      mentorAvatar: undefined,
      date: booking.mentorSlot.date,
      time: booking.mentorSlot.start_time,
      status: booking.status,
    }));
  }

  private async getRecentBookings(userId: number): Promise<RecentBooking[]> {
    const bookings = await this.bookingRepository.find({
      where: {
        member: { id: userId },
        status: BookingStatus.COMPLETED,
      },
      relations: ['mentorSlot', 'mentorSlot.mentor'],
      order: { updated_at: 'DESC' },
      take: 2,
    });

    return bookings.map((booking) => ({
      id: booking.id,
      mentorName: booking.mentorSlot?.mentor?.name || 'Unknown Mentor',
      mentorAvatar: undefined,
      date: booking.mentorSlot.date,
      time: booking.mentorSlot.start_time,
      status: booking.status,
    }));
  }
}
