import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Booking, BookingStatus } from '../booking.entity';
import { AppLoggerService } from '@/common/services/app-logger.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly logger: AppLoggerService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.logger.setContext('RatingsService');
  }

  async create(createRatingDto: CreateRatingDto, memberId: number) {
    const { bookingId, rating, review } = createRatingDto;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['member', 'mentorSlot', 'mentorSlot.mentor'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.member.id !== memberId) {
      throw new ForbiddenException(
        'You can only rate your own booking sessions',
      );
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'You can only rate completed booking sessions',
      );
    }

    const existingRating = await this.ratingRepository.findOne({
      where: { booking: { id: bookingId } },
    });

    if (existingRating) {
      throw new BadRequestException(
        'You have already rated this booking session',
      );
    }

    const newRating = this.ratingRepository.create({
      booking,
      member: booking.member,
      mentor: booking.mentorSlot.mentor,
      rating,
      review,
    });

    const savedRating = await this.ratingRepository.save(newRating);
    this.logger.log(
      `Rating created for booking ${bookingId} by member ${memberId}`,
    );

    await this.notificationsService.notifyNewRating(
      booking.mentorSlot.mentor.id,
      booking.member.name,
      rating,
      bookingId,
    );

    return {
      success: true,
      message: 'Rating submitted successfully',
      data: savedRating,
    };
  }

  async update(
    ratingId: number,
    updateRatingDto: UpdateRatingDto,
    memberId: number,
  ) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['member'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.member.id !== memberId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    Object.assign(rating, updateRatingDto);
    const updatedRating = await this.ratingRepository.save(rating);

    this.logger.log(`Rating ${ratingId} updated by member ${memberId}`);
    return {
      success: true,
      message: 'Rating updated successfully',
      data: updatedRating,
    };
  }

  async findByMentor(mentorId: number, page = 1, limit = 10) {
    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { mentor: { id: mentorId } },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: ratings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByMember(memberId: number, page = 1, limit = 10) {
    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { member: { id: memberId } },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: ratings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByBooking(bookingId: number) {
    return this.ratingRepository.findOne({
      where: { booking: { id: bookingId } },
    });
  }

  async getMentorAverageRating(mentorId: number) {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'averageRating')
      .addSelect('COUNT(rating.id)', 'totalRatings')
      .where('rating.mentor_id = :mentorId', { mentorId })
      .getRawOne();

    return {
      averageRating: result.averageRating
        ? parseFloat(parseFloat(result.averageRating).toFixed(1))
        : 0,
      totalRatings: parseInt(result.totalRatings) || 0,
    };
  }

  async delete(ratingId: number, memberId: number) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['member'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.member.id !== memberId) {
      throw new ForbiddenException('You can only delete your own ratings');
    }

    await this.ratingRepository.remove(rating);
    this.logger.log(`Rating ${ratingId} deleted by member ${memberId}`);

    return {
      success: true,
      message: 'Rating deleted successfully',
    };
  }
}
