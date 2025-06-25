import { AppDataSource } from '@/config/data-source';
import { Gender, User, UserRole } from '@/core/users/user.entity';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  const existing = await userRepo.findOne({
    where: { email: 'admin@fitsmart.com' },
  });

  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = userRepo.create({
    name: 'Admin User',
    email: 'admin@fitsmart.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
    gender: Gender.MALE,
    country: 'Sri Lanka',
    language: 'Sinhala',
    created_at: new Date(),
    updated_at: new Date(),
  });

  await userRepo.save(admin);
  console.log('Admin user created successfully');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to create admin user:', err);
  process.exit(1);
});
