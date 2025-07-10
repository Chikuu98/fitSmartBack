import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import { AcceptedPlan } from '../entities/accepted-plan.entity';
import { PlanAnalytics } from '../entities/plan-analytics.entity';
import { DailyProgress } from '../entities/daily-progress.entity';
import { WorkoutProgress } from '../entities/workout-progress.entity';
import { MealProgress } from '../entities/meal-progress.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let acceptedPlanRepository: Repository<AcceptedPlan>;
  let planAnalyticsRepository: Repository<PlanAnalytics>;
  let dailyProgressRepository: Repository<DailyProgress>;
  let workoutProgressRepository: Repository<WorkoutProgress>;
  let mealProgressRepository: Repository<MealProgress>;

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
      sum: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(AcceptedPlan),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(PlanAnalytics),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DailyProgress),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(WorkoutProgress),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(MealProgress),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    acceptedPlanRepository = module.get<Repository<AcceptedPlan>>(
      getRepositoryToken(AcceptedPlan),
    );
    planAnalyticsRepository = module.get<Repository<PlanAnalytics>>(
      getRepositoryToken(PlanAnalytics),
    );
    dailyProgressRepository = module.get<Repository<DailyProgress>>(
      getRepositoryToken(DailyProgress),
    );
    workoutProgressRepository = module.get<Repository<WorkoutProgress>>(
      getRepositoryToken(WorkoutProgress),
    );
    mealProgressRepository = module.get<Repository<MealProgress>>(
      getRepositoryToken(MealProgress),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePlanAnalytics', () => {
    it('should generate analytics for an accepted plan', async () => {
      const userId = 1;
      const acceptedPlanId = 1;

      const mockAcceptedPlan = {
        id: 1,
        user: { id: 1 },
        status: 'completed',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const mockAnalytics = {
        id: 1,
        acceptedPlanId: 1,
        userId: 1,
        completionRate: 85.5,
        consistencyScore: 78.2,
        weightChange: -2.5,
        avgEnergyLevel: 7.8,
        avgMoodRating: 8.1,
        totalWorkouts: 24,
        avgWorkoutDuration: 45.5,
        totalCaloriesBurned: 12500,
        totalMealsLogged: 90,
        avgMealAdherence: 82.3,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockAcceptedPlan);
      mockRepository.create.mockReturnValue(mockAnalytics);
      mockRepository.save.mockResolvedValue(mockAnalytics);

      // Mock the complex analytics calculations
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn(),
        getRawOne: jest.fn().mockResolvedValue({
          count: 30,
          avgWeight: 75.5,
          avgEnergyLevel: 7.8,
        }),
        avg: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        sum: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.generatePlanAnalytics(userId, acceptedPlanId);

      expect(acceptedPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: acceptedPlanId },
        relations: ['user'],
      });
      expect(planAnalyticsRepository.create).toHaveBeenCalled();
      expect(planAnalyticsRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw an error if accepted plan not found', async () => {
      const userId = 1;
      const acceptedPlanId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.generatePlanAnalytics(userId, acceptedPlanId)).rejects.toThrow(
        'Accepted plan not found',
      );
    });
  });

  describe('getPlanAnalytics', () => {
    it('should return analytics for a specific plan', async () => {
      const userId = 1;
      const acceptedPlanId = 1;

      const mockAnalytics = {
        id: 1,
        acceptedPlanId: 1,
        userId: 1,
        completionRate: 85.5,
        consistencyScore: 78.2,
        weightChange: -2.5,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockAnalytics);

      const result = await service.getPlanAnalytics(userId, acceptedPlanId);

      expect(planAnalyticsRepository.findOne).toHaveBeenCalledWith({
        where: { acceptedPlanId: acceptedPlanId, userId: userId },
        relations: ['acceptedPlan'],
      });
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('getUserAnalytics', () => {
    it('should return all analytics for a user', async () => {
      const userId = 1;

      const mockAnalyticsList = [
        {
          id: 1,
          userId: 1,
          completionRate: 85.5,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          completionRate: 78.2,
          createdAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockAnalyticsList),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        avg: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        sum: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUserAnalytics(userId);

      expect(planAnalyticsRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('analytics.userId = :userId', {
        userId,
      });
      expect(result).toEqual(mockAnalyticsList);
    });
  });

  describe('deleteAnalytics', () => {
    it('should delete analytics successfully', async () => {
      const userId = 1;
      const acceptedPlanId = 1;

      const mockAnalytics = {
        id: 1,
        userId: 1,
        acceptedPlanId: 1,
      };

      mockRepository.findOne.mockResolvedValue(mockAnalytics);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteAnalytics(userId, acceptedPlanId);

      expect(planAnalyticsRepository.findOne).toHaveBeenCalledWith({
        where: { acceptedPlanId: acceptedPlanId, userId: userId },
      });
      expect(planAnalyticsRepository.delete).toHaveBeenCalledWith({ acceptedPlanId });
    });

    it('should throw an error if analytics not found', async () => {
      const userId = 1;
      const acceptedPlanId = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteAnalytics(userId, acceptedPlanId)).rejects.toThrow(
        'Analytics not found',
      );
    });
  });
});
