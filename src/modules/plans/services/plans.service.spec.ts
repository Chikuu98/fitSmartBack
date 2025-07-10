import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlansService } from './plans.service';
import { OpenAIService } from './openai.service';
import { UserPreferencesService } from './user-preferences.service';
import { GeneratedPlan } from '../entities/generated-plan.entity';
import { AcceptedPlan } from '../entities/accepted-plan.entity';
import { WorkoutPlan } from '../entities/workout-plan.entity';
import { MealPlan } from '../entities/meal-plan.entity';
import { PlanType } from '../entities/plan-type.entity';
import { User, UserRole } from '../../../core/users/user.entity';
import { MemberDetail, FitnessLevel } from '../../../core/users/members/member_detail.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { MealItem } from '../entities/meal-item.entity';
import { GeneratePlanDto } from '../dto/generate-plan.dto';
import { AcceptPlanDto } from '../dto/accept-plan.dto';

describe('PlansService', () => {
  let service: PlansService;
  let generatedPlanRepository: Repository<GeneratedPlan>;
  let acceptedPlanRepository: Repository<AcceptedPlan>;
  let workoutPlanRepository: Repository<WorkoutPlan>;
  let mealPlanRepository: Repository<MealPlan>;
  let planTypeRepository: Repository<PlanType>;
  let openAIService: OpenAIService;
  let userPreferencesService: UserPreferencesService;

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
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockOpenAIService = {
    generatePlan: jest.fn(),
  };

  const mockUserPreferencesService = {
    getUserPreferences: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(MemberDetail),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(GeneratedPlan),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(AcceptedPlan),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(WorkoutPlan),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(WorkoutExercise),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(MealPlan),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(MealItem),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(PlanType),
          useValue: mockRepository,
        },
        {
          provide: OpenAIService,
          useValue: mockOpenAIService,
        },
        {
          provide: UserPreferencesService,
          useValue: mockUserPreferencesService,
        },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
    generatedPlanRepository = module.get<Repository<GeneratedPlan>>(
      getRepositoryToken(GeneratedPlan),
    );
    acceptedPlanRepository = module.get<Repository<AcceptedPlan>>(
      getRepositoryToken(AcceptedPlan),
    );
    workoutPlanRepository = module.get<Repository<WorkoutPlan>>(
      getRepositoryToken(WorkoutPlan),
    );
    mealPlanRepository = module.get<Repository<MealPlan>>(
      getRepositoryToken(MealPlan),
    );
    planTypeRepository = module.get<Repository<PlanType>>(
      getRepositoryToken(PlanType),
    );
    openAIService = module.get<OpenAIService>(OpenAIService);
    userPreferencesService = module.get<UserPreferencesService>(UserPreferencesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePlan', () => {
    it('should generate a plan successfully', async () => {
      const userId = 1;

      const generatePlanDto: GeneratePlanDto = {
        goal: 'Lose 10kg in 8 weeks',
        duration_days: 30,
        target_weight: 70,
        include_history: true,
      };

      const mockUser = {
        id: 1,
        email: 'test@test.com',
        role: UserRole.MEMBER,
        memberDetails: {
          age: 25,
          height: 175,
          weight: 80,
          fitness_level: FitnessLevel.INTERMEDIATE,
          goal: 'weight loss',
          dietary_preference: 'balanced',
        },
      };

      const mockAiResponse = {
        workouts: [
          {
            day: 1,
            exercises: [
              {
                name: 'Push-ups',
                sets: 3,
                reps: 10,
                duration: null,
                calories: 50,
              },
            ],
          },
        ],
        meals: [
          {
            day: 1,
            mealType: 'breakfast',
            items: [
              {
                name: 'Oatmeal',
                quantity: '1 cup',
                calories: 300,
                protein: 10,
                carbs: 50,
                fat: 5,
              },
            ],
          },
        ],
      };

      const mockGeneratedPlan = {
        id: 1,
        userId: 1,
        durationDays: 30,
        goal: 'Lose 10kg in 8 weeks',
        targetWeight: 70,
        aiResponse: mockAiResponse,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockOpenAIService.generatePlan.mockResolvedValue(mockAiResponse);
      mockRepository.create.mockReturnValue(mockGeneratedPlan);
      mockRepository.save.mockResolvedValue(mockGeneratedPlan);

      const result = await service.generatePlan(userId, generatePlanDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['memberDetails'],
      });
      expect(openAIService.generatePlan).toHaveBeenCalled();
      expect(generatedPlanRepository.create).toHaveBeenCalled();
      expect(generatedPlanRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw an error if user not found', async () => {
      const userId = 999;

      const generatePlanDto: GeneratePlanDto = {
        goal: 'Lose 10kg in 8 weeks',
        duration_days: 30,
        target_weight: 70,
        include_history: true,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.generatePlan(userId, generatePlanDto)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('acceptPlan', () => {
    it('should accept a plan successfully', async () => {
      const userId = 1;
      const planId = 1;

      const acceptPlanDto: AcceptPlanDto = {
        start_date: '2024-01-01',
        target_goal: 'Lose 5kg',
        initial_weight: 80,
        plan_name: 'My Fitness Plan',
      };

      const mockGeneratedPlan = {
        id: 1,
        userId: 1,
        durationDays: 30,
        goal: 'Lose 10kg in 8 weeks',
        aiResponse: {
          workouts: [
            {
              day: 1,
              exercises: [
                {
                  name: 'Push-ups',
                  sets: 3,
                  reps: 10,
                  duration: null,
                  calories: 50,
                },
              ],
            },
          ],
          meals: [
            {
              day: 1,
              mealType: 'breakfast',
              items: [
                {
                  name: 'Oatmeal',
                  quantity: '1 cup',
                  calories: 300,
                  protein: 10,
                  carbs: 50,
                  fat: 5,
                },
              ],
            },
          ],
        },
      };

      const mockAcceptedPlan = {
        id: 1,
        userId: 1,
        generatedPlanId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: 'active',
        planName: 'My Fitness Plan',
        targetGoal: 'Lose 5kg',
        initialWeight: 80,
      };

      mockRepository.findOne.mockResolvedValue(mockGeneratedPlan);
      mockRepository.create.mockReturnValue(mockAcceptedPlan);
      mockRepository.save.mockResolvedValue(mockAcceptedPlan);

      const result = await service.acceptPlan(userId, planId, acceptPlanDto);

      expect(generatedPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: planId, userId: userId },
      });
      expect(acceptedPlanRepository.create).toHaveBeenCalled();
      expect(acceptedPlanRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw an error if generated plan not found', async () => {
      const userId = 1;
      const planId = 999;

      const acceptPlanDto: AcceptPlanDto = {
        start_date: '2024-01-01',
        target_goal: 'Lose 5kg',
        initial_weight: 80,
        plan_name: 'My Fitness Plan',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.acceptPlan(userId, planId, acceptPlanDto)).rejects.toThrow(
        'Generated plan not found',
      );
    });
  });

  describe('getGeneratedPlans', () => {
    it('should return paginated generated plans', async () => {
      const userId = 1;

      const mockPlans = [
        {
          id: 1,
          userId: 1,
          durationDays: 30,
          createdAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockPlans),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getGeneratedPlans(userId, 10, 0);

      expect(generatedPlanRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('plan.userId = :userId', {
        userId: 1,
      });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockPlans);
    });
  });

  describe('getPlanTypes', () => {
    it('should return all plan types', async () => {
      const mockPlanTypes = [
        {
          id: 1,
          name: 'Weight Loss',
          description: 'Plan for weight loss',
        },
        {
          id: 2,
          name: 'Muscle Gain',
          description: 'Plan for muscle building',
        },
      ];

      mockRepository.find.mockResolvedValue(mockPlanTypes);

      const result = await service.getPlanTypes();

      expect(planTypeRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockPlanTypes);
    });
  });
});
