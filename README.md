# HealthNexus - Medical Symptom Checker & Doctor Appointment System

A comprehensive healthcare platform that combines AI-powered symptom checking, medication information, and doctor appointment management. Built with modern web technologies for a seamless user experience.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [Testing](#testing)
- [User Roles & Permissions](#user-roles--permissions)
- [Key Features Explained](#key-features-explained)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
---

## ✨ Features

### For Patients
- **Symptom Checker**: AI-powered symptom analysis with disease predictions
- **Medication Guide**: Comprehensive database of medications with detailed information
- **Doctor Search**: Find doctors by specialty, location, and availability
- **Appointment Booking**: Schedule appointments with verified doctors
- **Appointment Management**: View, track, and manage your appointments
- **User Profile**: Manage personal and medical information
- **Dark Mode**: Toggle between light and dark themes

### For Doctors
- **Doctor Registration**: Apply to become a verified doctor on the platform
- **Professional Profile**: Manage professional information, bio, and credentials
- **Schedule Management**: Set and update weekly availability
- **Patient Management**: View all patients who have booked appointments
- **Appointment Tracking**: Update appointment status, add diagnosis notes, and follow-up flags
- **Patient History**: Access complete appointment history for each patient

### For Administrators
- **Doctor Verification**: Review and approve/reject doctor applications
- **User Management**: Manage all users in the system
- **Doctor Management**: View and manage verified doctors
- **Disease Database**: Manage disease information (MongoDB)
- **Medication Database**: Manage medication information (MongoDB)
- **System Monitoring**: Track application health and performance

---

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **TailwindCSS** for styling
- **Shadcn/ui** for UI components
- **Lucide React** for icons
- **Context API** for state management
- **Vitest** for unit testing
- **Playwright** for E2E testing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for MySQL database
- **MongoDB** for disease/medication data
- **JWT** for authentication
- **bcrypt** for password hashing
- **Helmet** for security headers
- **Rate limiting** for API protection
- **Jest** for testing

### Databases
- **MySQL** - User data, appointments, doctor profiles
- **MongoDB** - Disease and medication information

### Security
- **JWT tokens** (access + refresh)
- **bcrypt** password hashing
- **Helmet** security headers
- **CORS** configuration
- **Rate limiting**
- **Input sanitization**
- **XSS protection**
- **SQL injection prevention**

---

## 📁 Project Structure

```
healthnexus/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, security, validation
│   │   ├── lib/              # Utilities (database, logger, etc.)
│   │   └── index.ts          # Server entry point
│   ├── database/
│   │   ├── prisma/           # Prisma schema and migrations
│   │   └── mongodb/          # MongoDB connection
│   ├── tests/                # Backend tests (Jest)
│   ├── logs/                 # Application logs
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts (Auth, Theme)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and API client
│   │   └── constants/        # App constants
│   ├── tests/                # Frontend tests (Vitest, Playwright)
│   └── package.json
│
├── docs/                     # Documentation files
├── start.bat                 # Windows startup script
├── start.sh                  # Unix/Mac startup script
└── README.md
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** (v8 or higher)
- **MongoDB** (local or Atlas)
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd healthnexus
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Database - MySQL
DATABASE_URL="mysql://username:password@localhost:3306/healthnexus_db"

# Test Database (separate database for testing)
DATABASE_TEST_URL="mysql://username:password@localhost:3306/healthnexus_test"

# MongoDB Atlas or Local
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/healthnexus?retryWrites=true&w=majority"

# Test MongoDB (separate database for testing)
MONGODB_TEST_URI="mongodb+srv://username:password@cluster.mongodb.net/healthnexus_test?retryWrites=true&w=majority"

# Admin Configuration
ADMIN_EMAIL="admin@example.com"

# JWT Authentication
JWT_ACCESS_SECRET="your-super-secure-access-token-secret-change-in-production"
JWT_REFRESH_SECRET="your-super-secure-refresh-token-secret-change-in-production"
JWT_EXPIRY=86400000

# App Configuration
NODE_ENV=development
PORT=5174

# Security Configuration
COOKIE_SECRET="your-cookie-secret-key"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
SESSION_EXPIRY=86400000

# Logging
LOG_LEVEL=warn

# Field-Level Encryption
ENCRYPTION_SECRET="your-encryption-key-change-in-production"

# Email Configuration (for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5174/api
VITE_ADMIN_EMAIL=admin@example.com
```

### Database Setup

1. **Create MySQL Databases**:
```sql
CREATE DATABASE healthnexus_db;
CREATE DATABASE healthnexus_test;
```

2. **Run Prisma Migrations**:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

3. **MongoDB Setup**:
   - Create a MongoDB database (local or Atlas)
   - Import disease and medication data if available

---

##  Running the Application

### Option 1: Using Startup Scripts

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5174
- **API Health Check**: http://localhost:5174/api/health

---

## 🐳 Docker Setup

The application is fully containerized with Docker for easy development and deployment.

### What's Included

- **MySQL 8.0** - User data, appointments, doctor profiles
- **MongoDB 7.0** - Disease and medication information
- **Backend API** - Node.js/Express application
- **Frontend** - React/Vite application


### Quick Start with Docker

**Start all services:**
```bash
docker-compose up
```

**Start in background (detached mode):**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**Stop and remove all data:**
```bash
docker-compose down -v
```

### First Time Setup

After starting containers for the first time, run database migrations:

```bash
# Enter backend container
docker-compose exec backend sh

# Run Prisma migrations
npx prisma migrate dev

# Create test database
docker-compose exec mysql mysql -u root -pWJ28@krhps -e "CREATE DATABASE IF NOT EXISTS healthnexus_test;"

# Exit container
exit
```

### Access Containerized Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5174
- **MySQL**: localhost:3307
- **MongoDB**: localhost:27017



### Docker Files

- `backend/Dockerfile` - Backend container configuration
- `frontend/Dockerfile` - Frontend container configuration
- `docker-compose.yaml` - Orchestrates all services
- `backend/.dockerignore` - Excludes files from backend build
- `frontend/.dockerignore` - Excludes files from frontend build


---

## 🧪 Testing

### Backend Tests (Jest)

The backend has a comprehensive test suite with 143 tests covering all major functionality.

**Run all tests:**
```bash
cd backend
npm test
```

**Run specific test file:**
```bash
npm test -- auth.test.ts
npm test -- doctors.test.ts
npm test -- appointments.test.ts
```

**Run tests with coverage:**
```bash
npm test -- --coverage
```

**Test Suites:**
- `auth.test.ts` - Authentication (15 tests)
- `diseases.test.ts` - Disease CRUD (14 tests)
- `medications.test.ts` - Medication CRUD (14 tests)
- `doctors.test.ts` - Doctor management (17 tests)
- `profile.test.ts` - User profiles (11 tests)
- `appointments.test.ts` - Appointments (13 tests)
- `authorization.test.ts` - Authorization (15 tests)
- `schedule.test.ts` - Doctor schedules (12 tests)
- `security.test.ts` - Security features (20 tests)

**Test Database:**
- Tests use a separate database (`healthnexus_test`)
- Test accounts use `@healthnexus.test` email domain
- Tests run in isolation and clean up after themselves
- Real data is never affected by tests

### Frontend Tests

**Unit Tests (Vitest):**
```bash
cd frontend
npm test
```

**E2E Tests (Playwright):**
```bash
cd frontend
npm run test:e2e
```

**E2E Tests with UI:**
```bash
npm run test:e2e:ui
```

---

## 👥 User Roles & Permissions

### USER (Default)
- Browse diseases and medications
- Use symptom checker
- Search for doctors
- Book appointments
- Manage personal profile
- Apply to become a doctor

### DOCTOR
- All USER permissions
- Manage professional profile
- Set weekly availability schedule
- View patient list
- Update appointment status
- Add diagnosis notes and follow-up flags
- View patient appointment history

### ADMIN
- All USER permissions
- Review and approve/reject doctor applications
- Manage all users
- Manage verified doctors
- Deactivate doctor accounts
- Access system health metrics
- Manage disease/medication databases

---

## 🔑 Key Features Explained

### 1. Authentication System

**Registration Flow:**
1. User signs up with email and password
2. Email verification sent (OTP)
3. User verifies email
4. Account activated

**Login Flow:**
1. User enters credentials
2. System validates and returns JWT tokens
3. Access token (short-lived) for API requests
4. Refresh token (long-lived) for token renewal

**Security Features:**
- Password hashing with bcrypt (12 salt rounds)
- JWT token-based authentication
- Refresh token rotation
- Failed login attempt tracking
- Account lockout after multiple failures

### 2. Doctor Verification System

**Application Process:**
1. User applies as doctor (4-step form)
   - Personal information
   - Professional credentials (specialty, license, education)
   - Contact information
   - Bio, languages, and schedule
2. License number encrypted with bcrypt
3. Application submitted with `isVerified: false` and `isActive: false`
4. Admin reviews application in dashboard
5. Admin approves or rejects
   - **Approve**: Doctor becomes active and verified
   - **Reject**: Doctor profile deleted, user role reverted to USER

**Important Notes:**
- License numbers are encrypted and never displayed
- Rejected doctors can reapply
- Only verified doctors appear in public search
- Only verified doctors can accept appointments

### 3. Appointment System

**Booking Flow:**
1. Patient searches for doctors
2. Selects doctor and views availability
3. Chooses date and time
4. Provides reason for visit
5. Appointment created with status: PENDING

**Appointment Statuses:**
- **PENDING**: Awaiting confirmation
- **CONFIRMED**: Doctor confirmed
- **COMPLETED**: Visit completed
- **CANCELLED**: Cancelled by patient/doctor
- **NO_SHOW**: Patient didn't attend

**Doctor Management:**
- View all appointments
- Update status
- Mark as visited
- Flag for follow-up
- Add diagnosis notes
- Add general notes

### 4. Schedule Management

**For Doctors:**
- Set weekly availability (day, start time, end time)
- Multiple time slots per day
- Edit schedule anytime from profile
- Example: Monday 9:00-17:00, Wednesday 14:00-20:00

**For Patients:**
- View doctor availability when booking
- Only book during scheduled hours

### 5. Patient Management (Doctors)

**Features:**
- View all patients who booked appointments
- See patient contact information
- View blood type and allergies
- Access complete appointment history
- Track appointment statistics (completed, upcoming, cancelled)
- Click patient to see detailed history
- Click appointment to update details

---

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/register          - Register new user
POST   /api/v1/auth/login             - Login user
POST   /api/v1/auth/refresh           - Refresh access token
POST   /api/v1/auth/logout            - Logout user
POST   /api/v1/auth/verify-email      - Verify email with OTP
POST   /api/v1/auth/forgot-password   - Request password reset
POST   /api/v1/auth/reset-password    - Reset password
```

### User Endpoints

```
GET    /api/v1/user/profile           - Get user profile
PUT    /api/v1/user/profile           - Update user profile
GET    /api/v1/user/sessions          - Get active sessions
DELETE /api/v1/user/sessions/:id      - Revoke session
```

### Doctor Endpoints

```
GET    /api/v1/doctors                - Get all verified doctors
GET    /api/v1/doctors/:id            - Get doctor by ID
POST   /api/v1/doctors/register       - Apply as doctor (public)
PUT    /api/v1/doctors/profile        - Update own profile (doctor)
PUT    /api/v1/doctors/profile/schedule - Update own schedule (doctor)
PUT    /api/v1/doctors/:id/verify     - Approve doctor (admin)
POST   /api/v1/doctors/:id/reject     - Reject doctor (admin)
DELETE /api/v1/doctors/:id            - Deactivate doctor (admin)
```

### Appointment Endpoints

```
POST   /api/v1/appointments           - Create appointment
GET    /api/v1/appointments           - Get all appointments (admin)
GET    /api/v1/appointments/my-appointments - Get user appointments
GET    /api/v1/appointments/doctor-appointments - Get doctor appointments
PUT    /api/v1/appointments/:id       - Update appointment (doctor)
DELETE /api/v1/appointments/:id       - Cancel appointment
```

### Disease & Medication Endpoints

```
GET    /api/diseases                  - Get all diseases
GET    /api/diseases/:id              - Get disease by ID
POST   /api/diseases                  - Create disease (admin)
PUT    /api/diseases/:id              - Update disease (admin)
DELETE /api/diseases/:id              - Delete disease (admin)

GET    /api/medications               - Get all medications
GET    /api/medications/:id           - Get medication by ID
POST   /api/medications               - Create medication (admin)
PUT    /api/medications/:id           - Update medication (admin)
DELETE /api/medications/:id           - Delete medication (admin)
```

---

## 🗄️ Database Schema

### MySQL Tables (Prisma)

**users**
- id, email, passwordHash, firstName, lastName
- emailVerified, role (USER/DOCTOR/ADMIN)
- isActive, failedLoginAttempts, lockedUntil
- createdAt, updatedAt

**user_profiles**
- userId (FK), dateOfBirth, gender, country
- height, weight, bloodType, allergies
- darkMode, dataSharing

**doctors**
- userId (FK), specialty, address, city, country
- phone, bio, yearsOfExperience, education, languages
- licenseNumberHash (encrypted)
- isActive, isVerified

**doctor_schedules**
- doctorId (FK), dayOfWeek (0-6)
- startTime, endTime, isActive

**appointments**
- userId (FK), doctorId (FK)
- appointmentDate, appointmentTime
- reason, notes, status
- visited, needsFollowUp, diagnosisNotes

**refresh_tokens**
- userId (FK), token, expiresAt
- ipAddress, userAgent, deviceName
- isRevoked, rememberMe

### MongoDB Collections

**diseases**
- name, category, symptoms, description
- severity, treatments, prevention

**medications**
- name, genericName, brandNames
- category, dosage, sideEffects
- interactions, contraindications

---

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (USER, DOCTOR, ADMIN)
- Password hashing with bcrypt (12 salt rounds)
- Email verification with OTP
- Password reset with secure tokens

### API Security
- **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
- **CORS**: Configured allowed origins
- **Rate Limiting**: Different limits per endpoint type
- **Input Sanitization**: XSS and NoSQL injection prevention
- **HPP**: HTTP Parameter Pollution protection

### Data Protection
- License numbers encrypted with bcrypt
- Sensitive data never exposed in API responses
- Field-level encryption for diagnosis data
- Secure session management

### Monitoring & Logging
- Structured logging with Pino
- Security event logging
- Failed login attempt tracking
- Request correlation IDs

---


## 📝 Default Admin Account

After running migrations, create an admin account:

1. Register a new user with the email specified in `ADMIN_EMAIL`
2. The system automatically assigns ADMIN role
3. Login with admin credentials
4. Access admin dashboard at `/admin`

---

## 🎨 UI Features

### Theme Support
- Light and dark mode
- User preference saved in profile
- Automatic theme persistence

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode compatible

---

## 📚 Additional Resources

### Documentation Files
- `docs/disease-categories.md` - Disease categorization
- `docs/diseases-list.md` - Disease database structure
- `docs/database schema.png` - Visual database schema

---


## Disclaimer
### Important Medical Disclaimer:

- This application is for educational and informational purposes only
- It is NOT a substitute for professional medical advice, diagnosis, or treatment
- Always seek the advice of your physician or qualified health provider
- In case of emergency, call your local emergency services immediately

---

##  Acknowledgments

Built with love for better healthcare accessibility and education

---

## 🖼️ Image Credits

Background images used in the application are from Unsplash:

- **Doctor/Healthcare Image**: [Woman in white dress sitting on black office rolling chair](https://unsplash.com/fr/photos/femme-en-robe-blanche-assise-sur-une-chaise-roulante-de-bureau-noire-uVnRa6mOLOM) by Unsplash
- **Medication Image**: [White blue and orange medication pill](https://unsplash.com/fr/photos/pilule-de-medicament-blanc-bleu-et-orange-KltoLK6Mk-g) by Unsplash

All images are used under the [Unsplash License](https://unsplash.com/license).


