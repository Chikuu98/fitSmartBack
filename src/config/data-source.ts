import { DataSource } from 'typeorm';

import * as dotenv from 'dotenv';
import { User } from '@/core/users/user.entity';
import { MemberDetails } from '@/core/users/members/member_details.entity';
import { MentorDetails } from '@/core/users/mentors/mentor_details.entity';
import { MentorTimeSlot } from '@/modules/mentorSlots/slots/mentor_time_slot.entity';
import { Booking } from '@/modules/bookings/booking.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, MemberDetails, MentorDetails, MentorTimeSlot, Booking],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

//npx typeorm migration:generate src/database/migrations/create-users-table -d src/config/data-source.ts
//npx typeorm migration:create src/database/migrations/create-users-table

