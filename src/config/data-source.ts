import { DataSource } from 'typeorm';
import { User } from '../core/users/user.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'fitsmart',
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

//npx typeorm migration:generate src/database/migrations/create-users-table -d src/config/data-source.ts
