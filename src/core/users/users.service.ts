import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMemberDetailsDto } from './dto/update-member-details.dto';
import { UpdateMentorDetailsDto } from './dto/update-mentor-details.dto';
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

  async findMentorsWithFilter(country?: string, language?: string, authUser?: any): Promise<any> {
    const query = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.mentorDetails', 'mentorDetails')
      .where('user.role = :role', { role: UserRole.MENTOR });

    let filterCountry = country;
    let filterLanguage = language;

    if (!country && !language && authUser?.userId) {
      const userEntity = await this.userRepo.findOne({ 
        where: { id: authUser.userId },
        select: ['country', 'language']
      });
      
      if (userEntity) {
        filterCountry = userEntity.country;
        filterLanguage = userEntity.language;
      }
    }

    if (filterCountry) {
      query.andWhere('user.country = :country', { country: filterCountry });
    }
    if (filterLanguage) {
      query.andWhere('user.language = :language', { language: filterLanguage });
    }

    const mentors = await query.getMany();
    
    return {
      success: true,
      data: mentors.map((mentor) => instanceToPlain(mentor)),
    };
  }

  async updateUser(userId: number, dto: UpdateUserDto, currentUser: any) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['memberDetails', 'mentorDetails'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== userId) {
      throw new BadRequestException('You can only update your own profile');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({ 
        where: { email: dto.email } 
      });
      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.gender !== undefined) user.gender = dto.gender;
    if (dto.country !== undefined) user.country = dto.country;
    if (dto.language !== undefined) user.language = dto.language;

    const savedUser = await this.userRepo.save(user);

    let relations: string[] = [];
    if (user.role === UserRole.MEMBER) {
      relations = ['memberDetails'];
    } else if (user.role === UserRole.MENTOR) {
      relations = ['mentorDetails'];
    }

    const updatedUser = await this.userRepo.findOne({
      where: { id: userId },
      relations,
    });

    return {
      success: true,
      message: 'User profile updated successfully',
      data: instanceToPlain(updatedUser),
    };
  }

  async updateMemberDetails(userId: number, dto: UpdateMemberDetailsDto, currentUser: any) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['memberDetails'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.MEMBER) {
      throw new BadRequestException('User is not a member');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== userId) {
      throw new BadRequestException('You can only update your own details');
    }

    let memberDetails = user.memberDetails;
    if (!memberDetails) {
      memberDetails = new MemberDetails();
      memberDetails.user = user;
    }

    if (dto.age !== undefined) memberDetails.age = dto.age;
    if (dto.height !== undefined) memberDetails.height = dto.height;
    if (dto.weight !== undefined) memberDetails.weight = dto.weight;
    if (dto.fitness_level !== undefined) memberDetails.fitness_level = dto.fitness_level;
    if (dto.goal !== undefined) memberDetails.goal = dto.goal;
    if (dto.dietary_preference !== undefined) memberDetails.dietary_preference = dto.dietary_preference;

    const savedDetails = await this.dataSource.getRepository(MemberDetails).save(memberDetails);

    return {
      success: true,
      message: 'Member details updated successfully',
      data: instanceToPlain(savedDetails),
    };
  }

  async updateMentorDetails(userId: number, dto: UpdateMentorDetailsDto, currentUser: any) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['mentorDetails'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new BadRequestException('User is not a mentor');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== userId) {
      throw new BadRequestException('You can only update your own details');
    }

    let mentorDetails = user.mentorDetails;
    if (!mentorDetails) {
      mentorDetails = new MentorDetails();
      mentorDetails.user = user;
    }

    if (dto.expertise !== undefined) mentorDetails.expertise = dto.expertise;
    if (dto.bio !== undefined) mentorDetails.bio = dto.bio;
    if (dto.certifications !== undefined) mentorDetails.certifications = dto.certifications;
    if (dto.social_links !== undefined) mentorDetails.social_links = dto.social_links;
    if (dto.contact_number !== undefined) mentorDetails.contact_number = dto.contact_number;

    const savedDetails = await this.dataSource.getRepository(MentorDetails).save(mentorDetails);

    return {
      success: true,
      message: 'Mentor details updated successfully',
      data: instanceToPlain(savedDetails),
    };
  }
}
