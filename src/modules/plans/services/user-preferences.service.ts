import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreferences } from '../entities/user-preferences.entity';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreferences)
    private userPreferencesRepository: Repository<UserPreferences>,
  ) {}

  async getUserPreferences(userId: number): Promise<UserPreferences | null> {
    return this.userPreferencesRepository.findOne({
      where: { user: { id: userId } }
    });
  }

  async createOrUpdatePreferences(userId: number, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      Object.assign(existing, preferences);
      existing.last_updated = new Date();
      return this.userPreferencesRepository.save(existing);
    } else {
      const newPreferences = this.userPreferencesRepository.create({
        ...preferences,
        user: { id: userId } as any,
      });
      return this.userPreferencesRepository.save(newPreferences);
    }
  }

  async updateLearningConfidence(userId: number, confidence: number): Promise<void> {
    await this.userPreferencesRepository.update(
      { user: { id: userId } },
      { learning_confidence: confidence, last_updated: new Date() }
    );
  }
}
