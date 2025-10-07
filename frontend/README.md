#  VeriShare Organization Portal

> **Next.js Verification Service** - Web platform for organizations to manage credential verification and trust relationships

The VeriShare Organization Portal is a comprehensive web application built with Next.js that enables organizations to onboard, manage verification processes, and interact with the VeriShare credential ecosystem. This portal serves as the administrative interface for verified organizations to issue and validate digital credentials.

## Overview

This frontend application implements **Phase 3** of the VeriShare project roadmap, providing:

- **Organization Onboarding Portal** - Streamlined registration and verification process
- **Trust Verification Engine** - Advanced credential validation and organization trust management
- **Verification API Integration** - GraphQL-powered verification services
- **Admin Dashboard** - Comprehensive management interface for verified organizations

## Features

### Organization Onboarding

- **Registration System** - Company details, RC numbers, domain verification
- **Identity Verification** - Government API integration and manual review workflows
- **Verification Badges** - Digital certificates for verified organizations

### Trust Verification Engine

- **Credential Validation** - Real-time verification of user credentials
- **Trust Scoring** - Organization reputation and reliability metrics
- **Revocation Management** - Handle compromised organizations and credentials

### Admin Dashboard

- **Organization Management** - View and manage all verified organizations
- **Access Logs** - Comprehensive audit trails of all verification activities
- **Analytics & Reporting** - Insights into verification patterns and usage

### Security & Compliance

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access** - Organization-specific permissions and controls
- **Audit Compliance** - Full traceability of all verification actions

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context / Zustand
- **API Integration**: GraphQL Client / REST APIs
- **Authentication**: JWT with secure storage
- **UI Components**: Custom components with accessibility

##  Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication routes
│   │   ├── (dashboard)/    # Protected dashboard routes
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components
│   │   ├── forms/         # Form components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities and configurations
│   │   ├── api/           # API client functions
│   │   ├── auth/          # Authentication utilities
│   │   ├── utils/         # Helper functions
│   │   └── validations/   # Form validation schemas
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── docs/                  # Documentation
```

##  Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)
- Git

### Installation

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Setup:**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5000/graphql
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

5. **Open browser:**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Access admin panel at `/admin`

### Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## API Integration

### Backend Connection

The frontend connects to the VeriShare backend API for:

- **Organization Management** - CRUD operations for organizations
- **Credential Verification** - Real-time credential validation
- **Blockchain Integration** - Access to blockchain services via backend
- **Audit Logging** - Comprehensive activity tracking

### GraphQL Endpoints

```typescript
// Example GraphQL queries
const VERIFY_CREDENTIAL = gql`
  query VerifyCredential($id: ID!, $address: String!) {
    verifyCredential(id: $id, ownerAddress: $address) {
      isValid
      credential {
        id
        type
        issuer
        issuedAt
      }
      verification {
        status
        timestamp
        verifier
      }
    }
  }
`;
```

##  Design System

### Brand Colors

- **Primary**: `#1D4ED8` (Blue) - Trust, security, innovation
- **Secondary**: `#7C3AED` (Purple) - Technology, future
- **Accent**: `#10B981` (Green) - Success, verification

### Typography

- **Primary Font**: Inter (sans-serif)
- **Heading Sizes**: 24px - 48px
- **Body Text**: 14px - 16px

### Components

- **Buttons**: Primary, secondary, outline variants
- **Forms**: Input fields, dropdowns, file uploads
- **Cards**: Organization profiles, credential displays
- **Tables**: Data grids with sorting and filtering

##  Authentication

### Organization Login

- Email/password authentication
- Organization domain verification
- Two-factor authentication (2FA)
- Session management with refresh tokens

### Authorization

- Role-based access control (RBAC)
- Organization-specific data isolation
- API rate limiting and abuse prevention

## Admin Features

### Dashboard Analytics

- Organization registration trends
- Verification request volumes
- Success/failure rates
- Geographic distribution

### Organization Management

- Approve/reject applications
- Update organization profiles
- Manage verification badges
- Handle revocation requests

### System Monitoring

- API health checks
- Blockchain connectivity status
- Error tracking and alerts
- Performance metrics

##  Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

##  Deployment

### Vercel (Recommended)

1. **Connect Repository:**

   - Import project to Vercel
   - Configure build settings

2. **Environment Variables:**

   - Set production API URLs
   - Configure authentication secrets

3. **Domain Setup:**
   - Custom domain configuration
   - SSL certificate management

### Docker Deployment

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

##  Configuration

### Environment Variables

| Variable                  | Description                | Required |
| ------------------------- | -------------------------- | -------- |
| `NEXT_PUBLIC_API_URL`     | Backend API base URL       | Yes      |
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL API endpoint       | Yes      |
| `NEXTAUTH_SECRET`         | Authentication secret      | Yes      |
| `NEXTAUTH_URL`            | Application URL            | Yes      |
| `DATABASE_URL`            | Database connection string | No       |

### Feature Flags

```typescript
// Feature toggles for gradual rollout
const FEATURES = {
  ADVANCED_ANALYTICS: process.env.NODE_ENV === "production",
  BULK_VERIFICATION: true,
  ORGANIZATION_INSIGHTS: false,
};
```

##  Contributing

### Development Workflow

1. **Create Feature Branch:**

   ```bash
   git checkout -b feature/organization-onboarding
   ```

2. **Follow Code Standards:**

   - Use TypeScript for all new code
   - Follow component naming conventions
   - Add proper error handling

3. **Testing:**

   - Unit tests for utilities
   - Integration tests for API calls
   - E2E tests for critical flows

4. **Pull Request:**
   - Descriptive title and description
   - Link to related issues
   - Screenshots for UI changes

### Code Quality

- **ESLint**: Configured for Next.js and TypeScript
- **Prettier**: Code formatting consistency
- **Husky**: Pre-commit hooks for quality checks
- **Commitizen**: Standardized commit messages

##  Documentation

- [API Documentation](../docs/API_SPEC.md)
- [System Architecture](../docs/SYSTEM_ARCHITECTURE.md)
- [Project Phases](../docs/PROJECT_PHASES.md)
- [Component Library](./docs/COMPONENTS.md)

##  Troubleshooting

### Common Issues

- **API Connection Failed**: Check backend is running and CORS is configured
- **Authentication Errors**: Verify JWT secrets and cookie settings
- **Build Failures**: Clear `.next` cache and reinstall dependencies
- **Styling Issues**: Check Tailwind configuration and CSS imports

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

##  License

This project is part of the VeriShare platform. See the main project LICENSE file for details.

---

**Version**: 0.1.0
**Phase**: 3 (Next.js Verification Service)
**Compatible with**: VeriShare Backend v1.0+
