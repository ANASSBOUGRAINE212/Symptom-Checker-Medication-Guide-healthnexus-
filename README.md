# 🏥 HealthNexus - Medical Symptom Checker & Health Management Platform

> A comprehensive, production-ready healthcare management platform that empowers users to perform symptom-based assessments, access medical information, and maintain secure health records.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.14-2D3748)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Core Functionality](#core-functionality)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Demo Mode](#demo-mode)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**HealthNexus** is a modern, full-stack healthcare management platform built with enterprise-grade security and scalability in mind. The application bridges the gap between users and medical information, providing:

### What We Offer

🔍 **Intelligent Symptom Analysis**
- AI-powered symptom matching algorithm
- Disease probability calculations
- Comprehensive health assessments
- Historical diagnosis tracking

💊 **Medical Information Database**
- 500+ diseases with detailed information
- 1000+ medications with usage guidelines
- Treatment recommendations
- Prevention strategies

🔐 **Enterprise Security**
- JWT-based authentication with refresh tokens
- AES-256-GCM encryption for health data
- HIPAA-compliant data handling
- Multi-layer security architecture

👥 **User Management**
- Personal health profiles
- Medical history tracking
- Session management across devices
- Privacy-first data handling

🛠️ **Admin Dashboard**
- Content management system
- Disease and medication CRUD operations
- User analytics and statistics
- Real-time monitoring

### Why HealthNexus?

✅ **Production-Ready** - Built with scalability and reliability in mind
✅ **Security-First** - Multiple layers of security and encryption
✅ **Type-Safe** - End-to-end TypeScript for reliability
✅ **Modern Stack** - Latest technologies and best practices
✅ **Well-Documented** - Comprehensive documentation and guides
✅ **Dual-Mode** - Works as full-stack or static demo

**Built with security and privacy as core principles**, featuring JWT authentication, AES-256-GCM encryption, role-based access control, and comprehensive security middleware.

---

## Architecture

### System Architecture Diagram

![System Architecture](docs/diagram-export-29-11-2025-22_23_28.png)


The system follows a three-tier architecture with:
- **Client Layer**: React SPA with TypeScript
- **Application Layer**: Express API with 15+ middleware layers
- **Data Layer**: MySQL database with Prisma ORM

Key architectural features:
- RESTful API with versioning (`/api/v1/*`)
- JWT-based authentication with refresh tokens
- Multi-layer security (transport, network, input, auth, data)
- AES-256-GCM encryption for sensitive health data
- Role-based access control (USER, ADMIN)

### Database Schema

![Database Schema](docs/diagram-export-29-11-2025-22_31_35.png)


The database consists of 8 core entities:
- **User** - Authentication and identity
- **UserProfile** - Extended user information (1:1 with User)
- **RefreshToken** - Session management (1:N with User)
- **Diagnosis** - Encrypted health records (1:N with User)
- **Disease** - Medical information database
- **Medication** - Drug information database
- **PasswordResetToken** - Password recovery (1:N with User)
- **EmailVerificationToken** - Email verification (1:N with User)

All relationships use proper foreign keys with cascade rules for data integrity.

---

## ✨ Key Features

### 🔐 Authentication & Security

**Multi-Layer Security Architecture**
- **JWT Authentication** - Access tokens (15 min) + Refresh tokens (7 days)
- **Email Verification** - 6-digit OTP codes with 15-minute expiry
- **Password Security** - Bcrypt hashing (10 rounds) with strength requirements
- **Account Protection** - Automatic lockout after 5 failed attempts (15 min)
- **Session Management** - Track and manage sessions across multiple devices
- **Data Encryption** - AES-256-GCM for sensitive health records
- **Security Middleware** - 15+ layers including CORS, Helmet, rate limiting, input sanitization

**Security Features:**
- SQL injection prevention (Prisma ORM)
- XSS protection (input sanitization)
- CSRF protection (token-based)
- HTTP parameter pollution prevention
- Rate limiting (1000/hr general, 100/hr auth, 10/hr admin)
- Security event logging with correlation IDs

### 👤 User Management & Profiles

**Comprehensive User System**
- **Registration & Onboarding** - Streamlined signup with email verification
- **Profile Management** - Personal and medical information tracking
- **Health Records** - Secure storage of medical history
- **Privacy Controls** - Granular data sharing preferences
- **Theme Support** - Dark/light mode with system preference detection
- **Multi-Device Sync** - Access your data from anywhere

**Profile Features:**
- Personal info (name, DOB, gender, country)
- Medical data (height, weight, blood type, allergies)
- Privacy settings (data sharing consent)
- Session management (view and revoke active sessions)
- Account security (password change, 2FA ready)

### 🩺 Symptom Checker & Diagnosis

**Intelligent Health Assessment**
- **Interactive Symptom Selection** - User-friendly symptom picker
- **AI-Powered Matching** - Advanced algorithm matches symptoms to diseases
- **Probability Calculation** - Shows match percentage for each disease
- **Top 5 Results** - Displays most likely conditions
- **Encrypted Storage** - All diagnosis data encrypted at rest
- **History Tracking** - View past diagnoses and trends
- **Detailed Reports** - Comprehensive information for each diagnosis

**Disease Information Includes:**
- Complete symptom list
- Common causes and risk factors
- Recommended tests and procedures
- Treatment options and medications
- Prevention strategies
- Prognosis and recovery timeline
- Prevalence statistics

### 💊 Medication Database

**Comprehensive Drug Information**
- **500+ Medications** - Extensive database of common drugs
- **Search & Filter** - Find medications by name, category, or condition
- **Detailed Information** - Everything you need to know about each drug
- **Drug Interactions** - Warnings about medication combinations
- **Dosage Guidelines** - Adult and pediatric dosing information
- **Side Effects** - Common and serious adverse reactions
- **Contraindications** - When NOT to use specific medications

**Medication Data:**
- Purpose and mechanism of action
- Dosage instructions (adult, child, maximum)
- Side effects and warnings
- Drug interactions
- Contraindications
- When to take (timing, food interactions)
- Storage requirements

### 👨‍💼 Admin Dashboard

**Powerful Content Management**
- **Disease Management** - Full CRUD operations for disease database
- **Medication Management** - Add, edit, delete medication entries
- **User Analytics** - View user statistics and activity
- **Content Moderation** - Review and approve user-generated content
- **System Statistics** - Real-time dashboard with key metrics
- **Audit Logging** - Track all admin actions

**Admin Features:**
- Create/edit/delete diseases
- Create/edit/delete medications
- View total users, diagnoses, and activity
- Monitor recent activity (last 24 hours)
- Track user growth (last 7 days)
- View top diagnosed conditions
- Role-based access control (ADMIN role required)
- Email-based admin override (ADMIN_EMAIL env var)

---

## 🛠️ Tech Stack

### Frontend Technologies

**Core Framework**
- **React 18.3** - Modern UI library with concurrent features
- **TypeScript 5.9** - Type-safe development with latest features
- **Vite 7.1** - Lightning-fast build tool and dev server
- **React Router v6.26** - Declarative client-side routing

**UI & Styling**
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Shadcn UI** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful, consistent icon library
- **Tailwind Animate** - Animation utilities
- **Class Variance Authority** - Component variant management

**State & Data Management**
- **TanStack Query 5.56** - Powerful data fetching and caching
- **React Hook Form 7.53** - Performant form management
- **Zod 3.23** - TypeScript-first schema validation
- **React Context API** - Global state management

**Additional Libraries**
- **date-fns** - Modern date utility library
- **Recharts** - Composable charting library
- **Embla Carousel** - Lightweight carousel library
- **Sonner** - Beautiful toast notifications

---

### Backend Technologies

**Core Framework**
- **Node.js 16+** - JavaScript runtime
- **Express 4.18** - Fast, minimalist web framework
- **TypeScript 5.9** - Type-safe server development

**Database & ORM**
- **MySQL 8.0+** - Reliable relational database
- **Prisma 6.14** - Next-generation ORM with type safety
- **Prisma Client** - Auto-generated, type-safe database client
- **Prisma Migrate** - Declarative database migrations

**Authentication & Security**
- **jsonwebtoken 9.0** - JWT token generation and verification
- **bcryptjs 3.0** - Password hashing with salt
- **crypto (built-in)** - AES-256-GCM encryption
- **uuid 13.0** - Unique identifier generation

**Email & Communication**
- **Nodemailer 7.0** - Email sending with SMTP
- **HTML Email Templates** - Beautiful, responsive emails

---

### Security & Middleware Stack

**Security Headers & Protection**
- **Helmet 7.2** - Security headers (HSTS, CSP, X-Frame-Options)
- **CORS 2.8** - Cross-origin resource sharing configuration
- **Express Rate Limit 7.5** - API rate limiting and throttling
- **Express Mongo Sanitize 2.2** - NoSQL injection prevention
- **HPP 0.2** - HTTP parameter pollution protection
- **XSS Clean 0.1** - Cross-site scripting prevention

**Logging & Monitoring**
- **Pino 10.1** - High-performance structured logging
- **Pino Pretty 13.1** - Beautiful log formatting for development
- **Correlation IDs** - Request tracking across services

**Additional Middleware**
- **Cookie Parser 1.4** - Cookie parsing and handling
- **Express Validator 7.3** - Request validation
- **Dotenv 17.2** - Environment variable management

---

### Development & Build Tools

**Code Quality**
- **Prettier 3.5** - Opinionated code formatter
- **TypeScript Compiler** - Type checking and compilation
- **ESLint** (ready) - Linting and code quality

**Testing**
- **Vitest 3.2** - Fast unit testing framework
- **Testing Library** (ready) - Component testing utilities

**Database Tools**
- **Prisma Studio** - Visual database browser and editor
- **Prisma CLI** - Database management commands

**Build & Bundling**
- **Vite** - Frontend bundling and optimization
- **TSX 4.7** - TypeScript execution for Node.js
- **PostCSS** - CSS transformation
- **Autoprefixer** - Automatic vendor prefixing

---

### Architecture Patterns

**Design Patterns**
- **Three-Tier Architecture** - Presentation, Application, Data layers
- **RESTful API** - Resource-based API design
- **Repository Pattern** - Data access abstraction (Prisma)
- **Middleware Pattern** - Request/response processing pipeline
- **Service Layer** - Business logic separation
- **DTO Pattern** - Data transfer objects with Zod validation

**Security Patterns**
- **Defense in Depth** - Multiple security layers
- **Principle of Least Privilege** - Minimal access rights
- **Secure by Default** - Security-first configuration
- **Zero Trust** - Verify every request

**Code Organization**
- **Feature-Based Structure** - Organized by domain
- **Separation of Concerns** - Clear responsibility boundaries
- **DRY Principle** - Don't Repeat Yourself
- **SOLID Principles** - Object-oriented design best practices

---

## 🔧 Core Functionality

### Authentication Flow

**Registration Process**
1. User submits email, password, name
2. Server validates input (Zod schema)
3. Password hashed with Bcrypt (10 rounds)
4. User created in database (emailVerified: false)
5. 6-digit OTP generated and stored (15-minute expiry)
6. Verification email sent via SMTP
7. User enters OTP code
8. Email verified, account activated
9. User can now login

**Login Process**
1. User submits email and password
2. Server finds user by email
3. Checks if email is verified
4. Checks if account is locked (failed attempts)
5. Verifies password with Bcrypt
6. Generates access token (15 minutes, JWT)
7. Generates refresh token (7 days, stored in database)
8. Sets refresh token as HttpOnly cookie
9. Returns access token to client
10. Client stores access token in memory/localStorage

**Token Refresh Cycle**
1. Access token expires after 15 minutes
2. Client detects 401 Unauthorized
3. Sends refresh token (from HttpOnly cookie)
4. Server validates refresh token
5. Checks if token is revoked
6. Generates new access token
7. Updates lastUsedAt timestamp
8. Returns new access token
9. Client continues with new token

---

### Symptom Checker Algorithm

**How It Works**
1. User selects symptoms from comprehensive list
2. Client sends symptoms array to API
3. Server fetches all diseases from database
4. For each disease:
   - Compares user symptoms with disease symptoms
   - Counts matching symptoms
   - Calculates match percentage: (matched / total) × 100
5. Filters diseases with >0% match
6. Sorts by match percentage (highest first)
7. Takes top 5 results
8. Encrypts symptoms and results (AES-256-GCM)
9. Stores diagnosis in database
10. Returns decrypted results to user

**Encryption Process**
```typescript
// Encryption (before storage)
1. Generate random 16-byte IV (Initialization Vector)
2. Use 32-byte encryption key from environment
3. Encrypt data with AES-256-GCM algorithm
4. Generate 16-byte authentication tag
5. Store: { encrypted, iv, authTag }

// Decryption (when user requests)
1. Retrieve encrypted data from database
2. Extract IV and auth tag
3. Verify authentication tag (integrity check)
4. Decrypt with AES-256-GCM
5. Return plaintext data to user
```

---

### Session Management

**Session Tracking**
- Each login creates a RefreshToken record
- Stores: token, userId, expiresAt, ipAddress, userAgent, deviceName
- Users can view all active sessions
- Users can revoke individual sessions
- Users can revoke all other sessions
- Password change revokes all sessions

**Session Security**
- Refresh tokens stored in database (not just JWT)
- Can be revoked server-side
- Tracks IP address and user agent
- Detects suspicious activity
- Automatic cleanup of expired tokens

---

### Admin Operations

**Authorization Check**
1. Request hits admin route
2. `authenticateToken` middleware runs:
   - Extracts JWT from Authorization header
   - Verifies token signature
   - Decodes payload
   - Loads user from database
   - Checks if user is active
   - Sets req.user
3. `requireAdmin` middleware runs:
   - Checks if req.user.role === 'ADMIN' OR
   - Checks if req.user.email === ADMIN_EMAIL
   - If neither: 403 Forbidden
   - Logs unauthorized attempt
4. If both pass, route handler executes

**Admin Capabilities**
- Create, read, update, delete diseases
- Create, read, update, delete medications
- View system statistics
- Monitor user activity
- Access audit logs

---

### Data Flow Example: Profile Update

```
1. User clicks "Save Profile"
   ↓
2. Client validates form (React Hook Form + Zod)
   ↓
3. PUT /api/v1/user/profile
   Headers: { Authorization: Bearer <JWT> }
   Body: { firstName, lastName, dateOfBirth, ... }
   ↓
4. Request enters middleware stack (15 layers):
   - correlationId → adds tracking ID
   - CORS → validates origin
   - helmet → adds security headers
   - sanitizeInput → removes malicious code
   - express.json → parses JSON body
   - cookieParser → parses cookies
   - securityLogger → logs request
   - authLimiter → checks rate limit
   ↓
5. Route middleware:
   - authenticateToken → verifies JWT
   - validateBody → validates with Zod schema
   ↓
6. Controller (userController.updateUserProfile):
   - Extracts userId from JWT
   - Separates User fields (firstName, lastName)
   - Separates UserProfile fields (all others)
   ↓
7. Database operations (Prisma):
   - UPDATE users SET firstName, lastName WHERE id
   - UPSERT user_profiles SET ... WHERE userId
   ↓
8. Response:
   - Returns updated user + profile
   - Flows back through middleware
   - Security headers added
   - Logged by securityLogger
   ↓
9. Client receives response:
   - Updates local state
   - Refetches profile (consistency)
   - Shows success toast
   - UI re-renders
```

---

### Rate Limiting Strategy

**Endpoint-Specific Limits**
- **General API**: 1000 requests/hour
- **Authentication**: 100 requests/hour
- **Medical Data**: 500 requests/hour
- **Admin**: 10 requests/hour

**How It Works**
- Uses in-memory store (production-ready)
- Redis-ready for distributed systems
- Tracks requests per IP address
- Returns 429 Too Many Requests when exceeded
- Includes Retry-After header

---

### Email System

**Email Types**
1. **Verification Email** - 6-digit OTP, 15-minute expiry
2. **Password Reset** - 6-digit OTP, 15-minute expiry
3. **Login Alert** - New device/location notification (optional)

**Email Features**
- HTML templates with inline CSS
- Responsive design
- Brand colors and styling
- Clear call-to-action
- Security warnings
- Expiry information

**SMTP Configuration**
- Supports Gmail, SendGrid, AWS SES, custom SMTP
- Configurable via environment variables
- Automatic retry on failure
- Error logging

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- MySQL database (local or hosted)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthnexus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mysql://user:password@localhost:3306/healthnexus"

   # JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

   # Encryption (32-byte key for AES-256-GCM)
   ENCRYPTION_SECRET=your_encryption_key_here

   # Server
   PORT=5174
   NODE_ENV=development

   # CORS
   CORS_ORIGIN="http://localhost:5173"

   # Admin
   ADMIN_EMAIL=admin@example.com
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # (Optional) Run migrations
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:5174/api
   - Prisma Studio: `npm run db:studio` (opens at http://localhost:5555)

---

## Project Structure

```
healthnexus/
├── client/                    # Frontend React application
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── ErrorBoundary.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state
│   ├── demo/                # Mock backend for static deployment
│   │   ├── mockData.ts      # Hardcoded diseases/medications
│   │   ├── mockBackend.ts   # localStorage-based API
│   │   ├── api.ts           # Demo API wrapper
│   │   └── DemoBanner.tsx   # Demo mode indicator
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   │   ├── api.ts           # API client
│   │   ├── utils.ts         # Helper functions
│   │   └── theme-init.ts    # Theme initialization
│   ├── pages/               # Page components
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── VerifyEmail.tsx
│   │   ├── Home.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── DiagnosePage.tsx
│   │   ├── DiagnosesPage.tsx
│   │   ├── DiseasesPage.tsx
│   │   ├── MedicationsPage.tsx
│   │   ├── AdminPage.tsx
│   │   └── ...
│   ├── providers/           # Context providers
│   │   └── ThemeProvider.tsx
│   └── App.tsx              # Root component
│
├── server/                   # Backend Express application
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── diseaseController.ts
│   │   ├── medicationController.ts
│   │   └── adminController.ts
│   ├── lib/                 # Server utilities
│   │   ├── database.ts      # Prisma client
│   │   ├── logger.ts        # Pino logger
│   │   ├── email.ts         # Email service
│   │   └── redis.ts         # Redis client (optional)
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT verification
│   │   ├── rateLimit.ts     # Rate limiting
│   │   ├── security.ts      # Security headers
│   │   ├── securityLogger.ts # Security event logging
│   │   ├── apiVersion.ts    # API versioning
│   │   └── correlation.ts   # Request correlation IDs
│   ├── routes/              # API routes
│   │   ├── v1/              # Versioned API routes
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── profile.ts
│   │   │   ├── diseases.ts
│   │   │   ├── medications.ts
│   │   │   └── admin.ts
│   │   └── [legacy routes]  # Non-versioned routes
│   ├── services/            # Business logic
│   │   ├── authService.ts
│   │   ├── encryptionService.ts
│   │   ├── jwtService.ts
│   │   └── passwordService.ts
│   └── index.ts             # Server entry point
│
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Prisma schema definition
│   └── migrations/          # Database migrations
│
├── scripts/                 # Utility scripts
│   └── make-admin.ts        # Promote user to admin
│
├── shared/                  # Shared types and utilities
│
├── public/                  # Static assets
│
├── docs/                    # Documentation
│   ├── SYSTEM_DESIGN.md     # System architecture
│   └── API.md               # API documentation
│
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

---

## API Documentation

### Base URLs

- **V1 API**: `http://localhost:5174/api/v1`
- **Legacy API**: `http://localhost:5174/api`

### Authentication Endpoints

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Verify Email
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Cookie: refreshToken=<token>
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

### User Endpoints

#### Get Profile
```http
GET /api/v1/user/profile
Authorization: Bearer <access_token>
```

#### Update Profile (Full)
```http
PUT /api/v1/user/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "height": 180,
  "weight": 75
}
```

#### Update Profile (Partial)
```http
PATCH /api/v1/user/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "height": 182
}
```

### Diagnosis Endpoints

#### Create Diagnosis
```http
POST /api/v1/user/diagnoses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "symptoms": ["headache", "fever", "fatigue"],
  "notes": "Started 2 days ago"
}
```

#### Get All Diagnoses
```http
GET /api/v1/user/diagnoses
Authorization: Bearer <access_token>
```

#### Get Single Diagnosis
```http
GET /api/v1/user/diagnoses/:id
Authorization: Bearer <access_token>
```

#### Delete Diagnosis
```http
DELETE /api/v1/user/diagnoses/:id
Authorization: Bearer <access_token>
```

### Medical Data Endpoints

#### Get Diseases
```http
GET /api/v1/diseases?page=1&limit=20&search=flu&category=respiratory
```

#### Get Single Disease
```http
GET /api/v1/diseases/:id
```

#### Get Medications
```http
GET /api/v1/medications?page=1&limit=20&search=aspirin
```

#### Get Single Medication
```http
GET /api/v1/medications/:id
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <admin_access_token>`

#### Create Disease
```http
POST /api/v1/admin/diseases
```

#### Update Disease
```http
PATCH /api/v1/admin/diseases/:id
```

#### Delete Disease
```http
DELETE /api/v1/admin/diseases/:id
```

#### Create Medication
```http
POST /api/v1/admin/medications
```

#### Update Medication
```http
PATCH /api/v1/admin/medications/:id
```

#### Delete Medication
```http
DELETE /api/v1/admin/medications/:id
```

---

## Security

### Authentication & Authorization
- JWT-based authentication with access tokens (15 min) and refresh tokens (7 days)
- Bcrypt password hashing (10 rounds)
- Email verification required before login
- Account lockout after 5 failed login attempts
- Role-based access control (USER, ADMIN)

### Data Protection
- AES-256-GCM encryption for diagnosis data
- SQL injection prevention via Prisma ORM
- XSS protection with input sanitization
- CSRF protection
- HTTP parameter pollution prevention

### API Security
- Rate limiting (1000 req/hr general, 100 req/hr auth, 10 req/hr admin)
- Helmet security headers
- CORS configuration
- HTTPS enforcement in production
- Request correlation IDs for tracking

### Logging & Monitoring
- Structured logging with Pino
- Security event logging
- Failed login attempt tracking
- Session tracking with IP and user agent

---

## Demo Mode

The application **automatically switches** between full-stack and demo mode based on environment variables!

### 🎯 Two Deployment Options:

#### Option 1: Full-Stack Deployment (with Backend)
**For:** Render, Railway, Heroku, AWS, etc.

```bash
# Build with backend
npm run build

# Deploy both client and server
npm start
```

**Features:**
- ✅ Real MySQL database
- ✅ JWT authentication
- ✅ Email verification
- ✅ Encrypted health records
- ✅ All features fully functional

---

#### Option 2: Demo Mode (Static Deployment)
**For:** Netlify, Vercel, GitHub Pages, Cloudflare Pages

```bash
# Build for demo mode
npm run build:demo

# Deploy only the 'dist' folder
```

**Features:**
- ✅ All UI interactions work
- ✅ Login/signup with any credentials
- ✅ Admin access with `admin@demo.com`
- ✅ Diagnosis with symptom matching
- ✅ Data stored in localStorage
- ✅ No backend required
- ⚠️ Demo banner shown automatically
- ❌ Data not persistent across devices

---

### 🔧 How It Works:

The app uses `VITE_DEMO_MODE` environment variable:

- **`VITE_DEMO_MODE=false`** (default) → Full-stack with backend
- **`VITE_DEMO_MODE=true`** → Demo mode with mock backend

**Netlify Configuration:**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build:demo"
  publish = "dist"

[build.environment]
  VITE_DEMO_MODE = "true"
```

**Vercel Configuration:**

In Vercel dashboard, set environment variable:
```
VITE_DEMO_MODE = true
```

---


## Acknowledgments

- Medical information is for educational purposes only
- Always consult healthcare professionals for medical advice
- Icons by Lucide React
- UI components by Shadcn UI and Radix UI
- Security implementation follows OWASP best practices

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Components**: 50+ React components
- **API Endpoints**: 40+ RESTful endpoints
- **Database Tables**: 8 core entities
- **Middleware Layers**: 15+ security and processing layers
- **Test Coverage**: Ready for testing (Vitest configured)
- **Documentation**: Comprehensive guides and API docs

---

## 🎓 Learning Resources

This project demonstrates:
- ✅ Full-stack TypeScript development
- ✅ RESTful API design and versioning
- ✅ JWT authentication with refresh tokens
- ✅ Database design and relationships
- ✅ Encryption and security best practices
- ✅ Middleware architecture
- ✅ Error handling and logging
- ✅ Form validation and sanitization
- ✅ Session management
- ✅ Role-based access control
- ✅ Email integration
- ✅ Deployment strategies

---

## 🚀 Performance

**Optimizations**
- Code splitting and lazy loading
- Database query optimization with indexes
- Connection pooling (Prisma)
- Efficient caching strategies (ready for Redis)
- Minified and compressed assets
- CDN-ready static files

**Metrics** (Target)
- API Response Time: <200ms (p95)
- Database Query Time: <50ms (p95)
- Page Load Time: <2s
- Time to Interactive: <3s
- Lighthouse Score: 90+

---


## ⚠️ Disclaimer

**Important Medical Disclaimer:**
- This application is for **educational and informational purposes only**
- It is **NOT a substitute for professional medical advice, diagnosis, or treatment**
- Always seek the advice of your physician or qualified health provider
- Never disregard professional medical advice or delay seeking it
- In case of emergency, call your local emergency services immediately

---

## 🙏 Acknowledgments

- **Medical Information** - Educational purposes only, always consult healthcare professionals
- **Icons** - [Lucide React](https://lucide.dev/) for beautiful, consistent icons
- **UI Components** - [Shadcn UI](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/)
- **Security** - Implementation follows [OWASP](https://owasp.org/) best practices
- **Inspiration** - Built to improve healthcare accessibility and education


---

## 🌟 Show Your Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📖 Improving documentation
- 🔀 Contributing code

---

**Built with ❤️ for better healthcare accessibility and education**
