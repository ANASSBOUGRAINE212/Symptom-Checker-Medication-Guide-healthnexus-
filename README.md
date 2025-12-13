# HealthNexus - Medical Symptom Checker & Health Management Platform

> A comprehensive, production-ready healthcare management platform that empowers users to perform symptom-based assessments, access medical information, and maintain secure health records.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![Prisma](https://img.shields.io/badge/Prisma-6.14-2D3748)
![Mongoose](https://img.shields.io/badge/Mongoose-8.0-green)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Tech Stack](#tech-stack)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

---

## Overview

**HealthNexus** is a modern, full-stack healthcare management platform built with enterprise-grade security and scalability in mind.

### What We Offer

**Intelligent Symptom Analysis**
- Intelligent symptom-to-disease matching by comparing user symptoms against disease database
- Disease probability calculations (70% user match + 30% disease coverage)
- Comprehensive health assessments with top 20 results
- Historical diagnosis tracking with encryption

**Medical Information Database**
- **6,626 diseases** with detailed information across 20+ categories
- Comprehensive medications database with usage guidelines
- Treatment recommendations and prevention strategies
- Severity and prevalence classifications

**Enterprise Security**
- JWT-based authentication with refresh token rotation
- AES-256-GCM encryption for health data
- 15+ middleware security layers
- Comprehensive import security with XSS/injection prevention

**User Management**
- Personal health profiles with medical data
- Session management across devices
- Privacy-first data handling
- Dark/light mode support

**Admin Dashboard**
- Disease and medication CRUD operations
- CSV/JSON import/export with security validation
- User analytics and statistics
- Template downloads for bulk imports

---

## Architecture

### System Architecture Diagram

![System Architecture](docs/diagram-export-13-12-2025-00_10_44.png)

### System Overview

The system follows a three-tier architecture:
- **Client Layer**: React SPA with TypeScript, TailwindCSS, ShadcnUI
- **API Layer**: Express with 15+ middleware layers, JWT auth, rate limiting
- **Data Layer**: Dual database (MySQL for users, MongoDB for medical data)

### Dual Database Architecture

| Database | Purpose | ORM/ODM | Tables/Collections |
|----------|---------|---------|-------------------|
| **MySQL** | User data, authentication, sessions | Prisma | 6 tables |
| **MongoDB** | Medical data (diseases, medications) | Mongoose | 2 collections |

### Why Dual Databases?

- **MySQL**: ACID compliance for user data, transactions, relationships
- **MongoDB**: Flexible schema for medical data, text search, scalability

---

## Database Schema

### Database Schema Diagram

![Database Schema](docs/database%20schema.png)

### MySQL Tables (6)

| Table | Purpose |
|-------|---------|
| `users` | User accounts, authentication, roles |
| `user_profiles` | Health profiles (height, weight, blood type, allergies) |
| `refresh_tokens` | Session management, device tracking |
| `diagnoses` | Encrypted diagnosis history |
| `password_reset_tokens` | Password reset flow |
| `email_verification_tokens` | Email verification flow |

### MongoDB Collections (2)

| Collection | Records | Purpose |
|------------|---------|---------|
| `diseases` | 6,626 | Disease database with symptoms, causes, treatments |
| `medications` | Variable | Medication database with dosage, interactions |

### Database Relationships

```
User (1) ----+---- (1) UserProfile
             |
             +---- (N) RefreshToken
             |
             +---- (N) Diagnosis ---- (ref) ---- Disease (MongoDB)
             |
             +---- (N) PasswordResetToken
             |
             +---- (N) EmailVerificationToken
```

---

## Key Features

### Authentication & Security

| Feature | Description |
|---------|-------------|
| JWT Authentication | Access tokens (15 min) + Refresh tokens (7-30 days) |
| Token Rotation | Refresh tokens rotated on use for security |
| Password Hashing | Bcrypt with 12 salt rounds |
| Email Verification | 6-digit OTP with 10-minute expiry |
| Account Lockout | Auto-lock after 5 failed attempts (15 min) |
| Session Management | Track and revoke sessions across devices |
| Data Encryption | AES-256-GCM for sensitive health data |

### Symptom Diagnosis Algorithm

```
1. User selects symptoms
2. Normalize symptom names (lowercase, remove special chars)
3. Query diseases with matching symptoms (MongoDB $in with regex)
4. Calculate match score for each disease:
   - userMatchPercent = (matched / userSymptoms) x 100
   - diseaseMatchPercent = (matched / diseaseSymptoms) x 100
   - finalScore = (userMatchPercent x 0.7) + (diseaseMatchPercent x 0.3)
5. Sort by score, return top 20
6. Encrypt and store diagnosis
```

### Admin Import/Export System

**Supported Formats:** CSV, JSON

**Security Validations:**
- File size limit: 10MB
- Record limit: 10,000
- Extension validation: .csv, .json only
- XSS pattern detection
- SQL injection prevention
- Field length limits
- Content sanitization

### Middleware Stack (15 Layers)

1. correlationId - Request tracking
2. addVersionHeaders - API version headers
3. deprecationWarning - Deprecated endpoint warnings
4. CORS - Cross-origin resource sharing
5. httpsRedirect - HTTP to HTTPS (production)
6. securityHeaders - X-Frame-Options, X-XSS-Protection
7. Helmet - HSTS, CSP headers
8. generateNonce - CSP nonce for scripts
9. mongoSanitize - NoSQL injection prevention
10. hpp - HTTP Parameter Pollution protection
11. sanitizeInput - XSS sanitization
12. express.json - JSON body parsing (10MB limit)
13. cookieParser - Cookie parsing
14. securityLogger - Security event logging
15. rateLimiters - Per-route rate limiting

### Rate Limiting

| Route | Window | Production | Development |
|-------|--------|------------|-------------|
| `/api/v1/*` | 15 min | 100 | 1000 |
| `/api/auth/*` | 15 min | 5 | 100 |
| `/api/diseases`, `/api/medications` | 15 min | 20 | 200 |
| `/api/admin/*` | 15 min | 10 | 10 |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI Framework |
| TypeScript | 5.9 | Type Safety |
| Vite | 7.1 | Build Tool |
| TailwindCSS | 3.4 | Styling |
| Shadcn UI | - | Component Library |
| React Query | 5.56 | Data Fetching |
| React Hook Form | 7.53 | Form Management |
| Zod | 3.23 | Validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | Runtime |
| Express | 4.18 | Web Framework |
| TypeScript | 5.9 | Type Safety |
| Prisma | 6.14 | MySQL ORM |
| Mongoose | 8.0 | MongoDB ODM |
| JWT | 9.0 | Authentication |
| Bcrypt | 3.0 | Password Hashing |
| Nodemailer | 7.0 | Email Service |

### Databases

| Database | Version | Purpose |
|----------|---------|---------|
| MySQL | 8.0+ | User Data |
| MongoDB | 7.0+ | Medical Data |

---

## Security

### Defense in Depth (6 Layers)

**Layer 1: Network Security**
- HTTPS enforcement
- CORS whitelist
- Rate limiting

**Layer 2: Input Validation**
- Request sanitization (XSS)
- NoSQL injection prevention
- SQL injection prevention (Prisma)
- HPP protection
- File upload validation

**Layer 3: Authentication**
- Password hashing (bcrypt 12 rounds)
- JWT verification
- Token expiry & rotation
- Account lockout
- Email verification

**Layer 4: Authorization**
- Role-based access (USER/ADMIN)
- Route protection
- Resource ownership checks
- Admin email whitelist

**Layer 5: Data Protection**
- Field-level encryption (AES-256-GCM)
- Sensitive data not logged
- PII protection
- Secure cookie flags

**Layer 6: Monitoring**
- Security event logging
- Failed login tracking
- Correlation IDs
- Audit trails

### Encryption Details

```
Algorithm: AES-256-GCM (Authenticated Encryption)
Key: SHA-256 hash of ENCRYPTION_SECRET
IV: 16 bytes (random per encryption)
Auth Tag: 16 bytes
Format: Base64( IV + AuthTag + EncryptedData )
```

---

## API Documentation

### Base URLs
- **Primary**: `http://localhost:5174/api`
- **Versioned**: `http://localhost:5174/api/v1`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Authenticate |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/verify-email` | Verify email with OTP |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with OTP |
| GET | `/auth/me` | Get current user |

### Disease Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/diseases` | List diseases (paginated) |
| GET | `/diseases/:id` | Get disease details |
| GET | `/diseases/export/csv` | Export to CSV (Admin) |
| GET | `/diseases/export/json` | Export to JSON (Admin) |
| POST | `/diseases/import/csv` | Import CSV/JSON (Admin) |
| POST | `/diseases` | Create disease (Admin) |
| PUT | `/diseases/:id` | Update disease (Admin) |
| DELETE | `/diseases/:id` | Delete disease (Admin) |

### Diagnosis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/diagnosis` | Submit symptoms |
| GET | `/v1/diagnosis/history` | Get history |
| GET | `/v1/diagnosis/:id` | Get details |


---

## Getting Started

### Prerequisites

- Node.js v16+
- MySQL 8.0+
- MongoDB 7.0+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd healthnexus

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Environment Setup

**Backend (.env)**
```env
PORT=5174
NODE_ENV=development
DATABASE_URL=mysql://user:password@localhost:3306/healthnexus
MONGODB_URI=mongodb://localhost:27017/healthnexus
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
ENCRYPTION_SECRET=your-32-character-encryption-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@healthnexus.com
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5174/api
VITE_APP_NAME=HealthNexus
```

### Database Setup

```bash
cd backend
npm run db:generate
npm run db:push
```

### Run Development

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:5174/api
- Health Check: http://localhost:5174/api/health

---

## Project Structure

```
healthnexus/
├── backend/
│   ├── database/
│   │   ├── mongodb/models/      # Mongoose models
│   │   └── prisma/schema.prisma # MySQL schema
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── lib/                 # Utilities (jwt, encryption, email)
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── index.ts             # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # Auth, Theme contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # API client, utilities
│   │   ├── pages/               # Page components
│   │   └── App.tsx
│   └── package.json
│
├── docs/
│   ├── eraser-architecture-prompt.md  # System architecture (Eraser.io)
│   ├── database-schema-eraser.md      # Database diagram (Eraser.io)
│   ├── code2flow-diagram.txt          # Flowcharts (Code2flow)
│   ├── diseases-list.md               # Disease list (6,626)
│   ├── disease-categories.md          # Category breakdown
│   └── sample-diseases-import.json    # Import sample
│
├── package.json
└── README.md
```

---

## Documentation

### Architecture Diagrams

| Document | Purpose | Tool |
|----------|---------|------|
| `docs/eraser-architecture-prompt.md` | Complete system architecture | Eraser.io |
| `docs/database-schema-eraser.md` | Database ER diagram | Eraser.io |
| `docs/code2flow-diagram.txt` | Flowcharts for all workflows | Code2flow |

### Data Files

| Document | Purpose |
|----------|---------|
| `docs/diseases-list.md` | Complete disease list (6,626) |
| `docs/disease-categories.md` | Disease category breakdown |
| `docs/sample-diseases-import.json` | Sample import file |

---

## Project Statistics

| Metric | Value |
|--------|-------|
| Diseases | 6,626 |
| Disease Categories | 20+ |
| API Endpoints | 35+ |
| Frontend Pages | 18 |
| MySQL Tables | 6 |
| MongoDB Collections | 2 |
| Middleware Layers | 15 |
| Security Layers | 6 |

---

## Disclaimer

**Important Medical Disclaimer:**
- This application is for **educational and informational purposes only**
- It is **NOT a substitute for professional medical advice, diagnosis, or treatment**
- Always seek the advice of your physician or qualified health provider
- In case of emergency, call your local emergency services immediately

---

## Acknowledgments

- **Medical Information** - Educational purposes only
- **Icons** - [Lucide React](https://lucide.dev/)
- **UI Components** - [Shadcn UI](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/)

---

**Built with love for better healthcare accessibility and education**
