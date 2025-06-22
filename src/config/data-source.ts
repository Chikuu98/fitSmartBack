import { DataSource } from 'typeorm';
import { User } from '../core/users/user.entity';
import { MemberDetails } from 'src/core/users/members/member_details.entity';
import { MentorDetails } from 'src/core/users/mentors/mentor_details.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, MemberDetails, MentorDetails],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

//npx typeorm migration:generate src/database/migrations/create-users-table -d src/config/data-source.ts
