# 🏛️ VeriShare Platform

> **Secure Credential Verification Ecosystem** - A comprehensive platform for digital credential management, verification, and trust relationships

VeriShare is a decentralized platform that enables organizations to onboard, verify credentials, and manage trust relationships through a secure blockchain-powered ecosystem. The platform provides seamless integration between web portals, mobile applications, and blockchain services for end-to-end credential lifecycle management.

## 🎯 Overview

VeriShare implements **Phase 3** of the credential verification roadmap, featuring:

- **Organization Portal** - Web-based administrative interface for verified organizations
- **Mobile Credential Management** - Flutter app for secure credential storage and verification
- **API Gateway Backend** - Node.js server providing unified API access
- **Blockchain Services** - Decentralized credential validation and audit trails

### Key Features

- **Secure Credential Management** - End-to-end encrypted credential storage and sharing
- **Real-time Verification** - Instant blockchain-powered credential validation
- **Organization Onboarding** - Streamlined registration and trust verification
- **Analytics Dashboard** - Comprehensive insights and audit trails
- **Cross-platform Integration** - Seamless web and mobile experience

## Architecture

```
verishare/
├── backend/           # Node.js API Gateway Server
│   ├── src/
│   ├── routes/
│   ├── middleware/
│   └── package.json
├── frontend/          # Next.js Organization Portal
│   ├── src/
│   ├── components/
│   ├── public/
│   └── package.json
├── mobile/            # Flutter Credential App
│   ├── lib/
│   ├── android/
│   ├── ios/
│   └── pubspec.yaml
├── blockchain/        # Node.js Blockchain Library
│   ├── src/
│   ├── contracts/
│   └── package.json
├── docs/              # Project Documentation
└── docker/            # Containerization
```

### Component Overview

| Component      | Technology           | Purpose                                     |
| -------------- | -------------------- | ------------------------------------------- |
| **Backend**    | Node.js + Express    | API Gateway, authentication, GraphQL        |
| **Frontend**   | Next.js + TypeScript | Organization portal and admin dashboard     |
| **Mobile**     | Flutter + Dart       | Credential wallet and verification scanner  |
| **Blockchain** | Node.js              | Decentralized credential validation library |

## Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Flutter SDK 3.7+** (for mobile development)
- **Git**
- **Docker** (optional, for containerized deployment)

### 1. Clone Repository

```bash
git clone https://github.com/Yusasive/VeriShare.git
cd verishare
```

### 2. Environment Setup

Create environment files for each component:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local

# Mobile
cp mobile/.env.example mobile/.env
```

### 3. Install Dependencies

#### Backend Setup

```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

#### Mobile Setup

```bash
cd ../mobile
flutter pub get
flutter run
```

#### Blockchain Library

```bash
cd ../blockchain
npm install
# Used as dependency by backend
```

### 4. Start Development Environment

```bash
# Terminal 1: Backend (Port 5000)
cd backend && npm run dev

# Terminal 2: Frontend (Port 3000)
cd frontend && npm run dev

# Terminal 3: Mobile (Device/Emulator)
cd mobile && flutter run
```

### 5. Access Applications

- **Organization Portal**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:5000](http://localhost:5000)
- **GraphQL Playground**: [http://localhost:5000/graphql](http://localhost:5000/graphql)
- **Mobile App**: Runs on connected device/emulator

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/verishare
JWT_SECRET=your-jwt-secret
BLOCKCHAIN_RPC_URL=http://localhost:8545
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5000/graphql
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

#### Mobile (.env)

```env
API_BASE_URL=http://localhost:5000
GRAPHQL_URL=http://localhost:5000/graphql
BLOCKCHAIN_RPC_URL=http://localhost:8545
APP_ENV=development
```

## Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm run test
npm run test:e2e
```

### Mobile Tests

```bash
cd mobile
flutter test
flutter test integration_test/
```

## CI/CD Pipeline

This project uses GitHub Actions for comprehensive CI/CD with the following workflows:

### 🔄 Continuous Integration (`ci.yml`)

- **Triggers**: Push/PR to `main`/`develop` branches
- **Backend**: Node.js linting, testing, building
- **Frontend**: TypeScript checking, linting, testing, building
- **Mobile**: Flutter analysis, testing, APK/iOS builds
- **Blockchain**: Library testing
- **Security**: Dependency auditing, vulnerability scanning
- **Docker**: Multi-stage builds with caching
- **Deployment**: Automated staging deployment

### 🚀 Production Deployment (`deploy.yml`)

- **Triggers**: GitHub releases or manual dispatch
- **Features**: Multi-environment support (staging/production)
- **Container Registry**: GitHub Container Registry integration
- **Kubernetes**: Rolling deployments with health checks
- **Rollback**: Automatic rollback on deployment failure
- **Notifications**: Slack integration for deployment status

### ✨ Code Quality (`quality.yml`)

- **Triggers**: All PRs and pushes
- **Linting**: ESLint, Prettier, Flutter analyze
- **Security**: License compliance, dependency vulnerability checks
- **Documentation**: Markdown link checking, formatting validation
- **Performance**: Lighthouse CI for frontend performance metrics
- **Quality Gates**: Blocks merges if quality standards aren't met

### 🐳 Local Development with Docker

Use Docker Compose for full local development environment:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build
```

### 🔧 Environment Setup

1. **Development**: Use `docker-compose.yml` for local development
2. **Staging**: Automatic deployment on pushes to `main`
3. **Production**: Manual deployment via release or workflow dispatch

### 📊 Pipeline Features

- **Parallel Jobs**: All components tested simultaneously
- **Caching**: Node modules, Flutter packages, Docker layers
- **Matrix Builds**: Multi-platform mobile builds (Android/iOS)
- **Security Scanning**: Trivy vulnerability scanning
- **Health Checks**: Post-deployment verification
- **Notifications**: Slack alerts for deployment status

## Deployment

### Docker Deployment

```bash
# Build all services
docker-compose up --build

# Or build individually
docker build -t verishare-backend ./backend
docker build -t verishare-frontend ./frontend
```

### Production Deployment

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm start
# Or deploy to Vercel/Netlify
```

#### Mobile

```bash
cd mobile
# Android
flutter build apk --release

# iOS (macOS only)
flutter build ios --release
```

## Component Details

### Backend API Gateway

- **Framework**: Node.js + Express
- **Features**: REST APIs, GraphQL, authentication, blockchain integration
- **Port**: 5000
- **Documentation**: See [backend/README.md](./backend/README.md)

### Frontend Organization Portal

- **Framework**: Next.js 15 + TypeScript
- **Features**: Organization onboarding, admin dashboard, credential verification
- **Port**: 3000
- **Documentation**: See [frontend/README.md](./frontend/README.md)

### Mobile Credential App

- **Framework**: Flutter + Dart
- **Features**: Credential wallet, QR verification, biometric security
- **Platforms**: Android, iOS
- **Documentation**: See [mobile/README.md](./mobile/README.md)

### Blockchain Services

- **Framework**: Node.js library
- **Features**: Credential validation, audit trails, decentralized storage
- **Integration**: Used by backend API
- **Documentation**: See [blockchain/README.md](./blockchain/README.md)

## Contributing

### Development Workflow

1. **Fork and Clone** the repository
2. **Create Feature Branch**: `git checkout -b feature/your-feature`
3. **Follow Component Guidelines** in respective README files
4. **Test Thoroughly** across all components
5. **Submit Pull Request** with detailed description

### Code Standards

- **Backend**: ESLint, Prettier, conventional commits
- **Frontend**: ESLint, TypeScript strict mode
- **Mobile**: Flutter analyze, Dart format
- **Documentation**: Keep READMEs updated with changes

## Documentation

- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md)
- [API Specifications](./docs/API_SPEC.md)
- [Project Phases](./docs/PROJECT_PHASES.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Guidelines](./docs/SECURITY.md)

## Troubleshooting

### Common Issues

- **Port Conflicts**: Ensure ports 3000, 5000 are available
- **Database Connection**: Verify MongoDB is running
- **Mobile Build Issues**: Check Flutter SDK and platform tools
- **API Errors**: Check backend logs and environment variables

### Getting Help

1. Check component-specific README files
2. Review [troubleshooting guide](./docs/TROUBLESHOOTING.md)
3. Open issue with detailed error logs

### Future Phases

- **Phase 4**: Advanced analytics and AI-powered verification
- **Phase 5**: Multi-blockchain support and enterprise integrations

## Contributors

**Project Lead:** Yusasive

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Version**: 3.0.0
**Phase**: 3 (Organization Portal & Mobile Integration)
**Status**: Active Development
