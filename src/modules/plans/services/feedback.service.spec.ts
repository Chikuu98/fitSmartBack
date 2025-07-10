import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackService } from './feedback.service';
import { AcceptedPlan } from '../entities/accepted-plan.entity';
import { PlanFeedback } from '../entities/plan-feedback.entity';
import { CreatePlanFeedbackDto } from '../dto/plan-feedback.dto';
import { GoalAchievement } from '../entities/plan-feedback.entity';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let acceptedPlanRepository: Repository<AcceptedPlan>;
  let planFeedbackRepository: Repository<PlanFeedback>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      avg: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnThis(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getRepositoryToken(AcceptedPlan),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(PlanFeedback),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    acceptedPlanRepository = module.get<Repository<AcceptedPlan>>(
      getRepositoryToken(AcceptedPlan),
    );
    planFeedbackRepository = module.get<Repository<PlanFeedback>>(
      getRepositoryToken(PlanFeedback),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFeedback', () => {
    it('should create feedback successfully', async () => {
      const userId = 1;
      const acceptedPlanId = 1;
      const feedbackDto: CreatePlanFeedbackDto = {
        overall_rating: 8,
        difficulty_rating: 6,
        enjoyment_rating: 9,
        effectiveness_rating: 7,
        goal_achievement: GoalAchievement.FULLY_ACHIEVED,
        would_recommend: true,
        would_repeat: false,
        most_helpful_aspect: 'Exercise variety',
        suggested_improvements: 'More quick meal options',
        additional_comments: 'Great plan overall, very well structured',
      };

      const mockAcceptedPlan = {
        id: 1,
        user: { id: 1 },
        status: 'completed',
      };

      const mockFeedback = {
        id: 1,
        userId: 1,
        acceptedPlanId: 1,
        overallRating: 8,
        difficultyRating: 6,
        enjoymentRating: 9,
        effectivenessRating: 7,
        goalAchievement: 'FULLY_ACHIEVED',
        wouldRecommend: true,
        mostHelpfulAspect: 'Exercise variety',
        suggestedImprovements: 'More quick meal options',
        detailedFeedback: 'Great plan overall, very well structured',
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockAcceptedPlan);
      mockRepository.create.mockReturnValue(mockFeedback);
      mockRepository.save.mockResolvedValue(mockFeedback);

      const result = await service.createFeedback(userId, acceptedPlanId, feedbackDto);

      expect(acceptedPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: acceptedPlanId },
        relations: ['user'],
      });
      expect(planFeedbackRepository.create).toHaveBeenCalled();
      expect(planFeedbackRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockFeedback);
    });

    it('should throw an error if accepted plan not found', async () => {
      const userId = 1;
      const acceptedPlanId = 999;
      const feedbackDto: CreatePlanFeedbackDto = {
        overall_rating: 8,
        difficulty_rating: 6,
        enjoyment_rating: 9,
        effectiveness_rating: 7,
        goal_achievement: 'FULLY_ACHIEVED',
        would_recommend: true,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createFeedback(userId, acceptedPlanId, feedbackDto),
      ).rejects.toThrow('Accepted plan not found');
    });
  });

  describe('getFeedbackByPlan', () => {
    it('should return feedback for a specific plan', async () => {
      const userId = 1;
      const acceptedPlanId = 1;

      const mockFeedback = {
        id: 1,
        userId: 1,
        acceptedPlanId: 1,
        overallRating: 8,
        difficultyRating: 6,
        enjoymentRating: 9,
        effectivenessRating: 7,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockFeedback);

      const result = await service.getFeedbackByPlan(userId, acceptedPlanId);

      expect(planFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: { acceptedPlanId: acceptedPlanId, userId: userId },
        relations: ['acceptedPlan'],
      });
      expect(result).toEqual(mockFeedback);
    });
  });

  describe('getUserFeedback', () => {
    it('should return all feedback for a user', async () => {
      const userId = 1;

      const mockFeedbackList = [
        {
          id: 1,
          userId: 1,
          overallRating: 8,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          overallRating: 7,
          createdAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockFeedbackList),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUserFeedback(userId);

      expect(planFeedbackRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('feedback.userId = :userId', {
        userId,
      });
      expect(result).toEqual(mockFeedbackList);
    });
  });

  describe('updateFeedback', () => {
    it('should update feedback successfully', async () => {
      const userId = 1;
      const feedbackId = 1;
      const updateDto: UpdatePlanFeedbackDto = {
        overall_rating: 9,
        detailed_feedback: 'Updated feedback',
      };

      const mockExistingFeedback = {
        id: 1,
        userId: 1,
        overallRating: 8,
        detailedFeedback: 'Original feedback',
      };

      const mockUpdatedFeedback = {
        ...mockExistingFeedback,
        overallRating: 9,
        detailedFeedback: 'Updated feedback',
      };

      mockRepository.findOne.mockResolvedValue(mockExistingFeedback);
      mockRepository.save.mockResolvedValue(mockUpdatedFeedback);

      const result = await service.updateFeedback(userId, feedbackId, updateDto);

      expect(planFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: { id: feedbackId, userId: userId },
      });
      expect(planFeedbackRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedFeedback);
    });

    it('should throw an error if feedback not found', async () => {
      const userId = 1;
      const feedbackId = 999;
      const updateDto: UpdatePlanFeedbackDto = { overall_rating: 9 };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateFeedback(userId, feedbackId, updateDto)).rejects.toThrow(
        'Feedback not found',
      );
    });
  });

  describe('deleteFeedback', () => {
    it('should delete feedback successfully', async () => {
      const userId = 1;
      const feedbackId = 1;

      const mockFeedback = {
        id: 1,
        userId: 1,
      };

      mockRepository.findOne.mockResolvedValue(mockFeedback);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteFeedback(userId, feedbackId);

      expect(planFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: { id: feedbackId, userId: userId },
      });
      expect(planFeedbackRepository.delete).toHaveBeenCalledWith(feedbackId);
    });

    it('should throw an error if feedback not found', async () => {
      const userId = 1;
      const feedbackId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteFeedback(userId, feedbackId)).rejects.toThrow(
        'Feedback not found',
      );
    });
  });

  describe('getFeedbackStatistics', () => {
    it('should return feedback statistics', async () => {
      const mockStats = {
        averageOverallRating: 7.5,
        averageDifficultyRating: 6.2,
        averageEnjoymentRating: 8.1,
        averageEffectivenessRating: 7.8,
        totalFeedback: 150,
        recommendationPercentage: 85,
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getFeedbackStatistics();

      expect(planFeedbackRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
