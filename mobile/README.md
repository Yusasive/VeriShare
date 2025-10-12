# VeriShare Mobile App

> **Flutter Credential Management** - Mobile application for secure digital credential management and verification

The VeriShare Mobile App is a cross-platform Flutter application that enables users to manage, share, and verify digital credentials on-the-go. This mobile interface implements **Phase 3** of the VeriShare project, providing seamless credential management with QR code verification and blockchain integration.

##  Overview

This mobile application implements **Phase 3** of the VeriShare project roadmap, offering:

- **Credential Management** - Secure storage and management of digital credentials
- **QR Verification System** - Instant credential verification via QR codes
- **Organization Portal Access** - Mobile interface for organization management
- **Blockchain Integration** - Direct interaction with VeriShare blockchain services

##  Features

### Credential Management

- **Digital Wallet** - Secure storage of credentials with biometric protection
- **Credential Sharing** - Easy sharing via QR codes and deep links
- **Import/Export** - Support for standard credential formats (JSON, PDF)
- **Offline Access** - View credentials without internet connection

### Verification System

- **QR Code Scanning** - Real-time credential verification
- **Instant Validation** - Blockchain-powered verification results
- **Verification History** - Track all verification activities
- **Bulk Verification** - Scan multiple credentials efficiently

### Organization Features

- **Organization Portal** - Mobile access to organization management
- **Trust Verification** - View organization credibility scores
- **Badge Management** - Display verification badges and certificates
- **Admin Functions** - Mobile admin capabilities for verified organizations

### Security & Privacy

- **Biometric Authentication** - Fingerprint/Face ID protection
- **End-to-End Encryption** - Secure credential storage
- **Privacy Controls** - Granular permission management
- **Audit Trail** - Complete activity logging

## 🛠 Tech Stack

- **Framework**: Flutter 3.7+
- **Language**: Dart
- **State Management**: Provider / Riverpod
- **Networking**: Dio HTTP Client
- **Storage**: Secure Storage with SQLite
- **Authentication**: JWT with biometric support
- **UI Framework**: Material Design 3 / Cupertino

##  Project Structure

```
mobile/
├── lib/
│   ├── core/                    # Core functionality
│   │   ├── config/             # App configuration
│   │   ├── constants/          # App constants
│   │   ├── services/           # Core services (auth, api)
│   │   ├── theme/              # App theming
│   │   └── utils/              # Utility functions
│   ├── features/               # Feature modules
│   │   ├── auth/               # Authentication screens
│   │   ├── credentials/        # Credential management
│   │   ├── verification/       # QR verification
│   │   ├── organizations/      # Organization portal
│   │   └── profile/            # User profile
│   ├── models/                 # Data models
│   ├── providers/              # State management
│   ├── widgets/                # Reusable UI components
│   └── main.dart               # App entry point
├── android/                     # Android platform code
├── ios/                         # iOS platform code
├── test/                        # Unit and widget tests
├── integration_test/            # Integration tests
└── docs/                        # Documentation
```

##  Quick Start

### Prerequisites

- Flutter SDK 3.7.2 or higher
- Dart SDK 2.19.0 or higher
- Android Studio (for Android development)
- Xcode 14+ (for iOS development on macOS)
- Connected device or emulator/simulator

### Installation

1. **Navigate to mobile directory:**

   ```bash
   cd mobile
   ```

2. **Install Flutter dependencies:**

   ```bash
   flutter pub get
   ```

3. **Environment Setup:**

   Create environment configuration file:

   ```bash
   cp .env.example .env
   ```

   Configure the following variables:

   ```env
   API_BASE_URL=http://localhost:5000
   GRAPHQL_URL=http://localhost:5000/graphql
   BLOCKCHAIN_RPC_URL=http://localhost:8545
   APP_ENV=development
   ```

4. **Run on device/emulator:**

   ```bash
   # For Android
   flutter run android

   # For iOS (macOS only)
   flutter run ios
   ```

### Development Commands

```bash
# Run with hot reload
flutter run

# Run tests
flutter test

# Run integration tests
flutter test integration_test/

# Build for Android APK
flutter build apk --release

# Build for iOS (macOS only)
flutter build ios --release

# Clean and rebuild
flutter clean && flutter pub get
```

##  API Integration

### Backend Connection

The mobile app connects to the VeriShare backend for:

- **Authentication** - User login and token management
- **Credential Operations** - CRUD operations for digital credentials
- **Verification Services** - Real-time credential validation
- **Organization Data** - Access to organization information

### GraphQL Integration

```dart
// Example GraphQL query for credential verification
const String verifyCredentialQuery = r'''
  query VerifyCredential($id: ID!, $ownerAddress: String!) {
    verifyCredential(id: $id, ownerAddress: $ownerAddress) {
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
''';
```

## Design System

### Brand Colors

- **Primary**: `#1D4ED8` (Blue) - Trust, security, innovation
- **Secondary**: `#7C3AED` (Purple) - Technology, future
- **Accent**: `#10B981` (Green) - Success, verification
- **Error**: `#EF4444` (Red) - Warnings and errors

### Typography

- **Primary Font**: Inter (Material Design 3)
- **Display**: 32-48pt for headers
- **Headline**: 24-32pt for section titles
- **Body**: 14-16pt for content
- **Caption**: 12pt for metadata

### Components

- **Credential Cards**: Display credential information
- **QR Scanner**: Camera-based QR code scanning
- **Verification Badges**: Status indicators
- **Organization Tiles**: Organization information display

## Authentication


### User Authentication

- **Email/Password**: Standard authentication
- **Biometric Login**: Fingerprint/Face ID support
- **Organization SSO**: Integration with organization portals
- **Magic Links**: Passwordless authentication option

### Security Features

- **Secure Storage**: Encrypted local credential storage
- **Token Management**: Automatic token refresh
- **Session Control**: Configurable session timeouts
- **Privacy Settings**: Granular data sharing controls

## Platform-Specific Features

### Android Features

- **Google Play Services**: Enhanced location and notification services
- **BiometricPrompt**: Native biometric authentication
- **NFC Support**: Contactless credential sharing
- **Background Sync**: Automatic credential updates

### iOS Features

- **Face ID/Touch ID**: Native biometric authentication
- **Wallet Integration**: Apple Wallet credential storage
- **iCloud Sync**: Cross-device credential synchronization
- **Push Notifications**: Advanced notification management

## Testing

```bash
# Run unit tests
flutter test

# Run widget tests
flutter test test/widget_test/

# Run integration tests
flutter test integration_test/

# Generate test coverage
flutter test --coverage
```

### Test Structure

- **Unit Tests**: Business logic and utilities
- **Widget Tests**: UI component testing
- **Integration Tests**: End-to-end user flows
- **Platform Tests**: Native platform integration

## Deployment

### Android Deployment

1. **Generate Signed APK:**

   ```bash
   flutter build apk --release
   ```

2. **Google Play Store:**

   - Create developer account
   - Upload APK/AAB
   - Configure store listing
   - Set up in-app purchases (if applicable)

### iOS Deployment

1. **Generate IPA:**

   ```bash
   flutter build ios --release
   ```

2. **App Store Connect:**

   - Create App Store developer account
   - Upload build via Xcode or Transporter
   - Configure app metadata and screenshots
   - Submit for review

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Flutter CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter test
      - run: flutter build apk --release
```

## Configuration

### Environment Variables

| Variable             | Description             | Required |
| -------------------- | ----------------------- | -------- |
| `API_BASE_URL`       | Backend API base URL    | Yes      |
| `GRAPHQL_URL`        | GraphQL endpoint URL    | Yes      |
| `BLOCKCHAIN_RPC_URL` | Blockchain RPC endpoint | Yes      |
| `APP_ENV`            | Environment (dev/prod)  | Yes      |

### Build Flavors

```yaml
# pubspec.yaml
flavors:
  development:
    app:
      name: "VeriShare Dev"
  staging:
    app:
      name: "VeriShare Staging"
  production:
    app:
      name: "VeriShare"
```

## Contributing

### Development Workflow

1. **Create Feature Branch:**

   ```bash
   git checkout -b feature/credential-wallet
   ```

2. **Follow Code Standards:**

   - Use Dart analysis rules
   - Follow Flutter best practices
   - Add comprehensive tests
   - Update documentation

3. **Testing:**

   - Unit tests for business logic
   - Widget tests for UI components
   - Integration tests for user flows

4. **Pull Request:**

   - Descriptive title and description
   - Link to related issues
   - Screenshots for UI changes
   - Test coverage maintained

### Code Quality

- **Flutter Analyze**: Static code analysis
- **Dart Format**: Code formatting consistency
- **Pre-commit Hooks**: Automated quality checks
- **Conventional Commits**: Standardized commit messages

## Documentation

- [API Documentation](../docs/API_SPEC.md)
- [System Architecture](../docs/SYSTEM_ARCHITECTURE.md)
- [Mobile UI Guidelines](./docs/UI_GUIDELINES.md)
- [Testing Strategy](./docs/TESTING.md)

## Troubleshooting

### Common Issues

- **Build Failures**: Run `flutter clean && flutter pub get`
- **iOS Build Issues**: Ensure Xcode and iOS Simulator are updated
- **Android Build Issues**: Check Android SDK and emulator setup
- **Permission Errors**: Configure app permissions in platform settings

### Debug Mode

Enable debug logging:

```bash
flutter run --debug
```

Or add debug flags to main.dart:

```dart
void main() {
  debugPrint = (String? message, {int? wrapWidth}) {
    // Custom debug logging
  };
  runApp(const MyApp());
}
```

## License

This project is part of the VeriShare platform. See the main project LICENSE file for details.

---

**Version**: 0.1.0
**Phase**: 3 (Flutter Mobile App)
**Compatible with**: VeriShare Backend v1.0+
