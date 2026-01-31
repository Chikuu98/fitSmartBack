# FIT-SMART Backend API

FIT-SMART is a comprehensive fitness and wellness platform that connects users with mentors, provides AI-powered workout plans, tracks progress, and facilitates community engagement. This repository contains the backend API built with NestJS, TypeScript, and MySQL.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features

- **User Management**: Registration, authentication, and profile management for members and mentors
- **Authentication**: JWT-based authentication with role-based access control (Admin, Member, Mentor)
- **Mentor Booking System**: Schedule and manage appointments with fitness mentors
- **AI-Powered Fitness Plans**: Generate personalized workout and nutrition plans using Google's Gemini AI
- **Community Forums**: Discussion threads, replies, likes, and tags for community engagement
- **Progress Tracking**: Monitor fitness goals and achievements
- **Reports & Analytics**: Generate user reports and dashboard insights
- **Notifications**: Real-time notification system for bookings and updates
- **Google Calendar Integration**: Sync mentor bookings with Google Calendar

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: MySQL with TypeORM
- **Authentication**: JWT with Passport
- **AI Integration**: Google Gemini AI
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Winston with daily rotate file
- **Validation**: Class Validator & Class Transformer

## Prerequisites

Before installing the application, ensure you have the following installed:

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **Yarn**: Version 1.22.x or higher ([Installation Guide](https://classic.yarnpkg.com/en/docs/install))
- **MySQL**: Version 8.x or higher ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git**: For cloning the repository ([Download](https://git-scm.com/downloads))

To verify installations, run:
```bash
node --version
yarn --version
mysql --version
```

## Installation Guide

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd fitSmartBack
```

### Step 2: Install Dependencies

```bash
yarn install
```

This will install all required packages as defined in `package.json`.

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory by copying the example file:

```bash
cp example.env .env
```

Edit the `.env` file with your configuration (see [Configuration](#configuration) section).

### Step 4: Set Up MySQL Database

1. **Create a MySQL database**:

```sql
CREATE DATABASE fitsmart;
```

2. **Create a MySQL user** (if needed):

```sql
CREATE USER 'fitsmart_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON fitsmart.* TO 'fitsmart_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 5: Run Database Migrations

Execute the following command to create database tables:

```bash
yarn migration:run
```

### Step 6: Seed Admin User

Create an initial admin user:

```bash
yarn seed:admin
```

Default admin credentials will be created as specified in the seed file.

### Step 7: Start the Application

```bash
# Development mode with hot-reload
yarn start:dev

# Production mode
yarn start:prod
```

The API will be available at `http://localhost:3000` (or the port specified in your `.env` file).

## Configuration

Configure the following environment variables in your `.env` file:

### Database Configuration

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=fitsmart_user
DB_PASSWORD=your_database_password
DB_NAME=fitsmart
```

### Application Settings

```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:5173
```

**Important**: Generate a strong JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Google Gemini AI Configuration

Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey):

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_PRIMARY_MODEL=gemini-2.5-flash
GEMINI_SECONDARY_MODEL=gemini-2.0-flash
GEMINI_TERTIARY_MODEL=gemini-2.0-flash-exp
GEMINI_FALLBACK_MODEL=gemini-2.5-pro
```

## Database Setup

### Running Migrations

The application uses TypeORM migrations to manage database schema. Migrations are located in `src/database/migrations/`.

```bash
# Run all pending migrations
yarn migration:run

# Revert last migration
npm run typeorm -- migration:revert -d src/config/data-source.ts
```

### Database Schema

The application includes the following main tables:
- **users**: User accounts (admin, member, mentor)
- **member_details**: Member-specific information and fitness goals
- **mentor_details**: Mentor profiles and specializations
- **certifications**: Mentor certifications
- **social_links**: Mentor social media links
- **mentor_time_slots**: Available booking slots
- **bookings**: Mentor appointment bookings
- **booking_payments**: Payment records
- **forum_types, forum_tags, forum_threads, forum_replies, forum_likes**: Community forum data
- **plan_types, generated_plans, accepted_plans, workout_plans**: AI-generated fitness plans
- **notifications**: User notifications
- **reports**: User activity reports

## Running the Application

### Development Mode

```bash
yarn start:dev
```

This starts the application with hot-reload enabled. Any changes to the source code will automatically restart the server.

### Production Mode

```bash
# Build the application
yarn build

# Start production server
yarn start:prod
```

### Debug Mode

```bash
yarn start:debug
```

Starts the application in debug mode, allowing you to attach a debugger (port 9229).

## API Documentation

Once the application is running, access the interactive API documentation:

**Swagger UI**: `http://localhost:3000/api-docs`

The Swagger documentation provides:
- Complete API endpoint reference
- Request/response schemas
- Authentication requirements
- Interactive API testing

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Main API Endpoints

- **Auth**: `/api/auth/*` - Login, registration, password reset
- **Users**: `/api/users/*` - User profile management
- **Members**: `/api/users/members/*` - Member-specific endpoints
- **Mentors**: `/api/users/mentors/*` - Mentor profiles and management
- **Bookings**: `/api/bookings/*` - Mentor booking system
- **Mentor Slots**: `/api/mentor-slots/*` - Availability management
- **Plans**: `/api/plans/*` - AI-generated fitness plans
- **Forums**: `/api/forums/*` - Community forum threads and replies
- **Dashboard**: `/api/dashboard/*` - Dashboard analytics
- **Reports**: `/api/reports/*` - User reports
- **Notifications**: `/api/notifications/*` - User notifications

## Project Structure

```
fitSmartBack/
├── src/
│   ├── common/              # Shared utilities and services
│   │   ├── decorators/      # Custom decorators (roles, etc.)
│   │   ├── guards/          # Auth guards (JWT, roles)
│   │   └── services/        # Logger service
│   ├── config/              # Configuration files
│   │   ├── data-source.ts   # TypeORM data source
│   │   ├── logger.config.ts # Winston logger setup
│   │   ├── swagger.config.ts# Swagger configuration
│   │   └── typeorm.config.ts# TypeORM configuration
│   ├── core/                # Core business modules
│   │   ├── auth/            # Authentication module
│   │   └── users/           # User management
│   │       ├── members/     # Member-specific logic
│   │       └── mentors/     # Mentor-specific logic
│   ├── database/            # Database related files
│   │   ├── migrations/      # TypeORM migrations
│   │   └── seeds/           # Database seeds
│   ├── modules/             # Feature modules
│   │   ├── bookings/        # Booking system
│   │   ├── communityForums/ # Forum functionality
│   │   ├── dashboard/       # Dashboard analytics
│   │   ├── mentorSlots/     # Mentor availability
│   │   ├── notifications/   # Notification system
│   │   ├── plans/           # AI fitness plans
│   │   └── reports/         # Reporting system
│   ├── app.module.ts        # Root application module
│   └── main.ts              # Application entry point
├── test/                    # E2E tests
├── logs/                    # Application logs
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Available Scripts

### Development

```bash
yarn start           # Start application
yarn start:dev       # Start with hot-reload (development)
yarn start:debug     # Start in debug mode
yarn start:prod      # Start production build
```

### Building

```bash
yarn build           # Compile TypeScript to JavaScript
```

### Code Quality

```bash
yarn lint            # Run ESLint and fix issues
yarn format          # Format code with Prettier
```

### Testing

```bash
yarn test            # Run unit tests
yarn test:watch      # Run tests in watch mode
yarn test:cov        # Generate test coverage report
yarn test:e2e        # Run end-to-end tests
```

### Database

```bash
yarn migration:run   # Run pending migrations
yarn seed:admin      # Create admin user
```

## Testing

The application includes comprehensive testing setup:

### Unit Tests

```bash
yarn test
```

Unit tests are located alongside source files with `.spec.ts` extension.

### End-to-End Tests

```bash
yarn test:e2e
```

E2E tests are located in the `test/` directory.

### Test Coverage

```bash
yarn test:cov
```

Generates a coverage report in the `coverage/` directory.

## Troubleshooting

### Common Issues

#### Port Already in Use

If port 3000 is already in use:
1. Change the `PORT` in your `.env` file
2. Or stop the process using port 3000:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

#### Database Connection Failed

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE fitsmart;`
- Verify MySQL user has proper permissions

#### Migration Errors

```bash
# Reset migrations (WARNING: drops all data)
npm run typeorm -- schema:drop -d src/config/data-source.ts
yarn migration:run
```

#### Module Not Found Errors

```bash
# Clear node modules and reinstall
rm -rf node_modules yarn.lock
yarn install
```

#### JWT Token Issues

- Ensure `JWT_SECRET` is set in `.env`
- Verify token is included in Authorization header
- Check token expiration

### Logs

Application logs are stored in the `logs/` directory:
- `application-%DATE%.log`: All logs
- `error-%DATE%.log`: Error logs only

Review logs for detailed error information:
```bash
cat logs/error-*.log
```

### Getting Help

For additional support:
1. Check the [NestJS Documentation](https://docs.nestjs.com)
2. Review API documentation at `/api-docs`
3. Check application logs in `logs/` directory
4. Verify all environment variables are correctly set

## License

This project is licensed for academic purposes.
