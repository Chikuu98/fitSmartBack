import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgressService } from './progress.service';
import { AcceptedPlan } from '../entities/accepted-plan.entity';
import { DailyProgress, EnergyLevel, Mood, SleepQuality, StressLevel } from '../entities/daily-progress.entity';
import { WorkoutProgress } from '../entities/workout-progress.entity';
import { MealProgress } from '../entities/meal-progress.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { MealItem } from '../entities/meal-item.entity';
import { CreateDailyProgressDto, UpdateDailyProgressDto } from '../dto/daily-progress.dto';
import { CreateWorkoutProgressDto } from '../dto/workout-progress.dto';
import { CreateMealProgressDto } from '../dto/meal-progress.dto';

describe('ProgressService', () => {
  let service: ProgressService;
  let acceptedPlanRepository: Repository<AcceptedPlan>;
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
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: getRepositoryToken(AcceptedPlan),
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
        {
          provide: getRepositoryToken(WorkoutExercise),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(MealItem),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    acceptedPlanRepository = module.get<Repository<AcceptedPlan>>(
      getRepositoryToken(AcceptedPlan),
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

  describe('createDailyProgress', () => {
    it('should create daily progress successfully', async () => {
      const userId = 1;
      const acceptedPlanId = 1;
      const progressDto: CreateDailyProgressDto = {
        progress_date: '2024-01-01',
        day_number: 1,
        current_weight: 75.5,
        energy_level: EnergyLevel.HIGH,
        mood: Mood.GOOD,
        sleep_hours: 8.5,
        sleep_quality: SleepQuality.GOOD,
        stress_level: StressLevel.LOW,
      };

      const mockAcceptedPlan = {
        id: 1,
        user: { id: 1 },
        status: 'active',
      };

      const mockDailyProgress = {
        id: 1,
        userId: 1,
        acceptedPlanId: 1,
        progressDate: new Date('2024-01-01'),
        dayNumber: 1,
        weight: 75.5,
        bodyFatPercentage: 15.2,
        muscleMass: 60.0,
        energyLevel: EnergyLevel.HIGH,
        mood: Mood.GOOD,
        sleepHours: 8.5,
        sleepQuality: SleepQuality.GOOD,
        stressLevel: StressLevel.LOW,
        createdAt: new Date(),
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockAcceptedPlan) // for accepted plan check
        .mockResolvedValueOnce(null); // for existing progress check
      mockRepository.create.mockReturnValue(mockDailyProgress);
      mockRepository.save.mockResolvedValue(mockDailyProgress);

      const result = await service.createDailyProgress(userId, acceptedPlanId, progressDto);

      expect(acceptedPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: acceptedPlanId },
        relations: ['user'],
      });
      expect(dailyProgressRepository.create).toHaveBeenCalled();
      expect(dailyProgressRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockDailyProgress);
    });

    it('should throw an error if accepted plan not found', async () => {
      const userId = 1;
      const acceptedPlanId = 999;
      const progressDto: CreateDailyProgressDto = {
        progress_date: '2024-01-01',
        day_number: 1,
        current_weight: 75.5,
        energy_level: EnergyLevel.HIGH,
        mood: Mood.GOOD,
        sleep_hours: 8.5,
        sleep_quality: SleepQuality.GOOD,
        stress_level: StressLevel.LOW,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createDailyProgress(userId, acceptedPlanId, progressDto),
      ).rejects.toThrow('Accepted plan not found');
    });
  });

  describe('getDailyProgress', () => {
    it('should return daily progress for a user', async () => {
      const userId = 1;
      const acceptedPlanId = 1;

      const mockDailyProgress = [
        {
          id: 1,
          userId: 1,
          progressDate: new Date('2024-01-01'),
          currentWeight: 75.5,
          energyLevel: EnergyLevel.HIGH,
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDailyProgress),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getDailyProgress(userId, acceptedPlanId);

      expect(dailyProgressRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(mockDailyProgress);
    });
  });

  describe('updateDailyProgress', () => {
    it('should update daily progress successfully', async () => {
      const userId = 1;
      const progressId = 1;
      const updateDto: UpdateDailyProgressDto = {
        current_weight: 75.0,
      };

      const mockExistingProgress = {
        id: 1,
        userId: 1,
        currentWeight: 75.5,
      };

      const mockUpdatedProgress = {
        ...mockExistingProgress,
        currentWeight: 75.0,
      };

      mockRepository.findOne.mockResolvedValue(mockExistingProgress);
      mockRepository.save.mockResolvedValue(mockUpdatedProgress);

      const result = await service.updateDailyProgress(userId, progressId, updateDto);

      expect(dailyProgressRepository.findOne).toHaveBeenCalledWith({
        where: { id: progressId, userId: userId },
      });
      expect(dailyProgressRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedProgress);
    });

    it('should throw an error if daily progress not found', async () => {
      const userId = 1;
      const progressId = 999;
      const updateDto: UpdateDailyProgressDto = { current_weight: 75.0 };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateDailyProgress(userId, progressId, updateDto),
      ).rejects.toThrow('Daily progress not found');
    });
  });
});
