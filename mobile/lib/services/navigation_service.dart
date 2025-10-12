import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class NavigationService {
  static const _storage = FlutterSecureStorage();
  static const _keyOnboardingCompleted = 'onboarding_completed';
  static const _keyWalletCreated = 'wallet_created';

  static Future<bool> hasCompletedOnboarding() async {
    final value = await _storage.read(key: _keyOnboardingCompleted);
    return value == 'true';
  }

  static Future<void> setOnboardingCompleted() async {
    await _storage.write(key: _keyOnboardingCompleted, value: 'true');
  }

  static Future<bool> hasWallet() async {
    final value = await _storage.read(key: _keyWalletCreated);
    return value == 'true';
  }

  static Future<void> setWalletCreated() async {
    await _storage.write(key: _keyWalletCreated, value: 'true');
  }

  static Future<void> resetNavigation() async {
    await _storage.delete(key: _keyOnboardingCompleted);
    await _storage.delete(key: _keyWalletCreated);
  }
}
