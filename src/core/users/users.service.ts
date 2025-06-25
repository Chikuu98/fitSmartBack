import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { MentorDetails } from './mentors/mentor_details.entity';
import { MemberDetails } from './members/member_details.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createMember(dto: CreateMemberDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      gender: dto.gender,
      role: UserRole.MEMBER,
      country: dto.country,
      language: dto.language,
    });

    const savedUser = await this.userRepo.save(user);

    const memberDetails = this.dataSource.getRepository(MemberDetails).create({
      user: savedUser,
      age: dto.age,
      height: dto.height,
      weight: dto.weight,
      fitness_level: dto.fitness_level,
      goal: dto.goal,
      dietary_preference: dto.dietary_preference,
    });

    await this.dataSource.getRepository(MemberDetails).save(memberDetails);

    return {
      message: 'Member registered successfully',
      success: true,
    };
  }

  async createMentor(dto: CreateMentorDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      gender: dto.gender,
      role: UserRole.MENTOR,
      country: dto.country,
      language: dto.language,
    });

    const savedUser = await this.userRepo.save(user);

    const mentorDetails = this.dataSource.getRepository(MentorDetails).create({
      user: savedUser,
      expertise: dto.expertise,
      bio: dto.bio,
      certifications: dto.certifications,
      social_links: dto.social_links,
      contact_number: dto.contact_number,
    });

    await this.dataSource.getRepository(MentorDetails).save(mentorDetails);

    return {
      message: 'Mentor registered successfully',
      success: true,
    };
  }

  async findAll(): Promise<any[]> {
    const users = await this.userRepo.find();
    return users.map((user) => instanceToPlain(user));
  }

  async findOne(id: number): Promise<any> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return instanceToPlain(user);
  }

  async findByEmail(email: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return instanceToPlain(user);
  }

  async findMe(user: any): Promise<any> {
    const userId = user.userId;
    let relations: string[] = [];

    if (user.role === 'member' || user.role === UserRole.MEMBER) {
      relations = ['memberDetails'];
    } else if (user.role === 'mentor' || user.role === UserRole.MENTOR) {
      relations = ['mentorDetails'];
    }

    const userEntity = await this.userRepo.findOne({
      where: { id: userId },
      relations,
    });

    if (!userEntity) {
      throw new NotFoundException(`User not found`);
    }

    return instanceToPlain(userEntity);
  }
}
