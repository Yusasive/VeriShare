import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class PinService {
  static const _storage = FlutterSecureStorage();
  static const _pinKey = 'user_pin';

  static Future<void> setPin(String pin) async {
    await _storage.write(key: _pinKey, value: pin);
  }

  static Future<String?> getPin() async {
    return await _storage.read(key: _pinKey);
  }

  static Future<bool> verifyPin(String pin) async {
    final stored = await getPin();
    return stored == pin;
  }

  static Future<void> clearPin() async {
    await _storage.delete(key: _pinKey);
  }
}
