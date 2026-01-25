import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanFeedback } from '../entities/plan-feedback.entity';
import { AcceptedPlan } from '../entities/accepted-plan.entity';
import { CreatePlanFeedbackDto } from '../dto/plan-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(PlanFeedback)
    private feedbackRepository: Repository<PlanFeedback>,
    @InjectRepository(AcceptedPlan)
    private acceptedPlanRepository: Repository<AcceptedPlan>,
  ) {}

  async createFeedback(
    userId: number,
    acceptedPlanId: number,
    dto: CreatePlanFeedbackDto,
  ): Promise<PlanFeedback> {
    const acceptedPlan = await this.acceptedPlanRepository.findOne({
      where: { id: acceptedPlanId },
      relations: ['user'],
    });

    if (!acceptedPlan || acceptedPlan.user.id !== userId) {
      throw new NotFoundException('Accepted plan not found');
    }

    const feedback = this.feedbackRepository.create({
      user: { id: userId },
      acceptedPlan: { id: acceptedPlanId },
      overall_rating: dto.overall_rating,
      goal_achievement: dto.goal_achievement,
      would_recommend: dto.would_recommend,
      additional_comments: dto.additional_comments,
    });

    return this.feedbackRepository.save(feedback);
  }

  async getFeedback(
    userId: number,
    acceptedPlanId: number,
  ): Promise<PlanFeedback | null> {
    return this.feedbackRepository.findOne({
      where: {
        acceptedPlan: { id: acceptedPlanId },
        user: { id: userId },
      },
      relations: ['acceptedPlan', 'user'],
    });
  }

  async getUserFeedback(userId: number): Promise<PlanFeedback[]> {
    return this.feedbackRepository.find({
      where: { user: { id: userId } },
      relations: ['acceptedPlan', 'acceptedPlan.generatedPlan'],
      order: { created_at: 'DESC' },
    });
  }

  async updateFeedback(
    userId: number,
    feedbackId: number,
    updates: Partial<CreatePlanFeedbackDto>,
  ): Promise<PlanFeedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: ['user'],
    });

    if (!feedback || feedback.user.id !== userId) {
      throw new NotFoundException('Feedback not found');
    }

    Object.assign(feedback, updates);
    return this.feedbackRepository.save(feedback);
  }

  async deleteFeedback(userId: number, feedbackId: number): Promise<void> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: ['user'],
    });

    if (!feedback || feedback.user.id !== userId) {
      throw new NotFoundException('Feedback not found');
    }

    await this.feedbackRepository.remove(feedback);
  }

  async getFeedbackStats(userId: number): Promise<{
    totalFeedbacks: number;
    averageOverallRating: number;
    recommendationRate: number;
  }> {
    const feedbacks = await this.feedbackRepository.find({
      where: { user: { id: userId } },
    });

    const totalFeedbacks = feedbacks.length;

    if (totalFeedbacks === 0) {
      return {
        totalFeedbacks: 0,
        averageOverallRating: 0,
        recommendationRate: 0,
      };
    }

    const averageOverallRating = feedbacks.reduce((sum, f) => sum + f.overall_rating, 0) / totalFeedbacks;
    const recommendationRate = (feedbacks.filter(f => f.would_recommend).length / totalFeedbacks) * 100;

    return {
      totalFeedbacks,
      averageOverallRating: Math.round(averageOverallRating * 100) / 100,
      recommendationRate: Math.round(recommendationRate * 100) / 100,
    };
  }
}
