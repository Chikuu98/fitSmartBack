import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberDetails } from './members/member_details.entity';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { MentorDetails } from './mentors/mentor_details.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createMember(dto: CreateMemberDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      gender: dto.gender,
      role: UserRole.MEMBER,
    });

    const savedUser = await this.userRepo.save(user);

    // Create MemberDetails
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

    return savedUser;
  }

    async createMentor(dto: CreateMentorDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      gender: dto.gender,
      role: UserRole.MENTOR,
    });

    const savedUser = await this.userRepo.save(user);

    // Create MentorDetails
    const mentorDetails = this.dataSource.getRepository(MentorDetails).create({
      user: savedUser,
      expertise: dto.expertise,
      bio: dto.bio,
      certifications: dto.certifications,
      social_links: dto.social_links,
      contact_number: dto.contact_number,
    });

    await this.dataSource.getRepository(MentorDetails).save(mentorDetails);

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }
}
