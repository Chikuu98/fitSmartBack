import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole, UserAccountStatus } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMemberDetailsDto } from './dto/update-member-details.dto';
import { UpdateMentorDetailsDto } from './dto/update-mentor-details.dto';
import { MentorDetail } from './mentors/mentor_detail.entity';
import { Certification } from './mentors/certification.entity';
import { SocialLink } from './mentors/social_link.entity';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';
import { MemberDetail } from './members/member_detail.entity';
import { instanceToPlain } from 'class-transformer';
import { Rating } from '@/modules/bookings/ratings/rating.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Rating)
    private ratingRepo: Repository<Rating>,
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

    const memberDetail = this.dataSource.getRepository(MemberDetail).create({
      user: savedUser,
      age: dto.age,
      height: dto.height,
      weight: dto.weight,
      fitness_level: dto.fitness_level,
      goal: dto.goal,
      dietary_preference: dto.dietary_preference,
    });

    await this.dataSource.getRepository(MemberDetail).save(memberDetail);

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
      status: UserAccountStatus.PENDING_REVIEW,
    });

    const savedUser = await this.userRepo.save(user);

    const mentorDetail = this.dataSource.getRepository(MentorDetail).create({
      user: savedUser,
      expertise: dto.expertise,
      bio: dto.bio,
      contact_number: dto.contact_number,
    });

    await this.dataSource.getRepository(MentorDetail).save(mentorDetail);
    return {
      message: 'Mentor registration submitted successfully. Your account is pending admin approval.',
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
    const user_id = user.user_id;
    let relations: string[] = [];

    if (user.role === 'member' || user.role === UserRole.MEMBER) {
      relations = ['memberDetail'];
    } else if (user.role === 'mentor' || user.role === UserRole.MENTOR) {
      relations = [
        'mentorDetail',
        'mentorDetail.certification',
        'mentorDetail.socialLink',
      ];
    }

    const userEntity = await this.userRepo.findOne({
      where: { id: user_id },
      relations,
    });

    if (!userEntity) {
      throw new NotFoundException(`User not found`);
    }

    return instanceToPlain(userEntity);
  }
  async findMentorsWithFilter(
    country?: string,
    language?: string,
    authUser?: any,
  ): Promise<any> {
    const query = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.mentorDetail', 'mentorDetail')
      .leftJoinAndSelect('mentorDetail.certification', 'certification')
      .leftJoinAndSelect('mentorDetail.socialLink', 'socialLink')
      .where('user.role = :role', { role: UserRole.MENTOR });

    let filterCountry = country;
    let filterLanguage = language;

    if (!country && !language && authUser?.user_id) {
      const userEntity = await this.userRepo.findOne({
        where: { id: authUser.user_id },
        select: ['country', 'language'],
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

    // Add average ratings for each mentor
    const mentorsWithRatings = await this.addAverageRatingsToMentors(mentors);

    return {
      success: true,
      data: mentorsWithRatings.map((mentor) => instanceToPlain(mentor)),
    };
  }

  // Helper method to calculate and add average ratings to mentors
  private async addAverageRatingsToMentors(mentors: User[]): Promise<any[]> {
    const mentorsWithRatings: any[] = [];

    for (const mentor of mentors) {
      const ratingStats = await this.ratingRepo
        .createQueryBuilder('rating')
        .select('AVG(rating.rating)', 'averageRating')
        .addSelect('COUNT(rating.id)', 'totalRatings')
        .where('rating.mentor_id = :mentorId', { mentorId: mentor.id })
        .getRawOne();

      const mentorWithRating = {
        ...mentor,
        averageRating: ratingStats.averageRating
          ? parseFloat(parseFloat(ratingStats.averageRating).toFixed(1))
          : 0,
        totalRatings: parseInt(ratingStats.totalRatings) || 0,
      };

      mentorsWithRatings.push(mentorWithRating);
    }

    return mentorsWithRatings;
  }

  async updateUser(user_id: number, dto: UpdateUserDto, currentUser: any) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
      relations: ['memberDetail', 'mentorDetail'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.user_id !== user_id
    ) {
      throw new BadRequestException('You can only update your own profile');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: dto.email },
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
      relations = ['memberDetail'];
    } else if (user.role === UserRole.MENTOR) {
      relations = ['mentorDetail'];
    }

    const updatedUser = await this.userRepo.findOne({
      where: { id: user_id },
      relations,
    });

    return {
      success: true,
      message: 'User profile updated successfully',
      data: instanceToPlain(updatedUser),
    };
  }

  async updateMemberDetails(
    user_id: number,
    dto: UpdateMemberDetailsDto,
    currentUser: any,
  ) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
      relations: ['memberDetail'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.MEMBER) {
      throw new BadRequestException('User is not a member');
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.user_id !== user_id
    ) {
      throw new BadRequestException('You can only update your own details');
    }

    let memberDetail = user.memberDetail;
    if (!memberDetail) {
      memberDetail = new MemberDetail();
      memberDetail.user = user;
    }

    if (dto.age !== undefined) memberDetail.age = dto.age;
    if (dto.height !== undefined) memberDetail.height = dto.height;
    if (dto.weight !== undefined) memberDetail.weight = dto.weight;
    if (dto.fitness_level !== undefined)
      memberDetail.fitness_level = dto.fitness_level;
    if (dto.goal !== undefined) memberDetail.goal = dto.goal;
    if (dto.dietary_preference !== undefined)
      memberDetail.dietary_preference = dto.dietary_preference;

    const savedDetails = await this.dataSource
      .getRepository(MemberDetail)
      .save(memberDetail);

    return {
      success: true,
      message: 'Member details updated successfully',
      data: instanceToPlain(savedDetails),
    };
  }

  async updateMentorDetails(
    user_id: number,
    dto: UpdateMentorDetailsDto,
    currentUser: any,
  ) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
      relations: ['mentorDetail'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new BadRequestException('User is not a mentor');
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.user_id !== user_id
    ) {
      throw new BadRequestException('You can only update your own details');
    }

    let mentorDetail = user.mentorDetail;
    if (!mentorDetail) {
      mentorDetail = new MentorDetail();
      mentorDetail.user = user;
    }

    if (dto.expertise !== undefined) mentorDetail.expertise = dto.expertise;
    if (dto.bio !== undefined) mentorDetail.bio = dto.bio;
    if (dto.contact_number !== undefined)
      mentorDetail.contact_number = dto.contact_number;

    const savedDetails = await this.dataSource
      .getRepository(MentorDetail)
      .save(mentorDetail);

    return {
      success: true,
      message: 'Mentor details updated successfully',
      data: instanceToPlain(savedDetails),
    };
  }

  async addCertification(user_id: number, dto: CreateCertificationDto) {
    const mentorDetail = await this.dataSource
      .getRepository(MentorDetail)
      .findOne({
        where: { user: { id: user_id } },
        relations: ['user'],
      });
    if (!mentorDetail) throw new NotFoundException('Mentor details not found');
    const cert = this.dataSource
      .getRepository(Certification)
      .create({ ...dto, mentorDetail });
    await this.dataSource.getRepository(Certification).save(cert);
    return { success: true, message: 'Certification added', data: cert };
  }

  async updateCertification(
    user_id: number,
    id: number,
    dto: UpdateCertificationDto,
  ) {
    const certRepo = this.dataSource.getRepository(Certification);
    const cert = await certRepo.findOne({
      where: { id },
      relations: ['mentorDetail.user'],
    });
    if (!cert || cert.mentorDetail.user.id !== user_id)
      throw new NotFoundException('Certification not found or not yours');
    Object.assign(cert, dto);
    await certRepo.save(cert);
    return { success: true, message: 'Certification updated', data: cert };
  }

  async addSocialLink(user_id: number, dto: CreateSocialLinkDto) {
    const mentorDetail = await this.dataSource
      .getRepository(MentorDetail)
      .findOne({
        where: { user: { id: user_id } },
        relations: ['user'],
      });
    if (!mentorDetail) throw new NotFoundException('Mentor details not found');
    const link = this.dataSource
      .getRepository(SocialLink)
      .create({ ...dto, mentorDetail });
    await this.dataSource.getRepository(SocialLink).save(link);
    return { success: true, message: 'Social link added', data: link };
  }

  async updateSocialLink(
    user_id: number,
    id: number,
    dto: UpdateSocialLinkDto,
  ) {
    const linkRepo = this.dataSource.getRepository(SocialLink);
    const link = await linkRepo.findOne({
      where: { id },
      relations: ['mentorDetail.user'],
    });
    if (!link || link.mentorDetail.user.id !== user_id)
      throw new NotFoundException('Social link not found or not yours');
    Object.assign(link, dto);
    await linkRepo.save(link);
    return { success: true, message: 'Social link updated', data: link };
  }

  async getPendingMentors(): Promise<any> {
    const pendingMentors = await this.userRepo.find({
      where: {
        role: UserRole.MENTOR,
        status: UserAccountStatus.PENDING_REVIEW,
      },
      relations: ['mentorDetail'],
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      data: pendingMentors.map((mentor) => instanceToPlain(mentor)),
    };
  }

  async getAllMentors(status?: UserAccountStatus): Promise<any> {
    const query = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.mentorDetail', 'mentorDetail')
      .leftJoinAndSelect('mentorDetail.certification', 'certification')
      .leftJoinAndSelect('mentorDetail.socialLink', 'socialLink')
      .where('user.role = :role', { role: UserRole.MENTOR });

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    query.orderBy('user.created_at', 'DESC');

    const mentors = await query.getMany();

    // Add average ratings for each mentor
    const mentorsWithRatings = await this.addAverageRatingsToMentors(mentors);

    return {
      success: true,
      data: mentorsWithRatings.map((mentor) => instanceToPlain(mentor)),
    };
  }

  async updateUserStatus(
    user_id: number,
    status: UserAccountStatus,
    adminUser: any,
  ): Promise<any> {
    if (adminUser.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only admins can update user status');
    }

    const user = await this.userRepo.findOne({
      where: { id: user_id },
      relations: ['mentorDetail'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status;
    await this.userRepo.save(user);

    let statusMessage = '';
    switch (status) {
      case UserAccountStatus.ACTIVE:
        statusMessage = 'User account has been activated successfully';
        break;
      case UserAccountStatus.SUSPENDED:
        statusMessage = 'User account has been suspended';
        break;
      case UserAccountStatus.BANNED:
        statusMessage = 'User account has been banned';
        break;
      case UserAccountStatus.PENDING_REVIEW:
        statusMessage = 'User account status set to pending review';
        break;
    }

    return {
      success: true,
      message: statusMessage,
      data: instanceToPlain(user),
    };
  }
}
