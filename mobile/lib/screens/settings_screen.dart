import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import '../services/pin_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _biometricsEnabled = false;
  bool _pinEnabled = false;
  String? _pinStatus;
  final TextEditingController _pinController = TextEditingController();
  final TextEditingController _verifyPinController = TextEditingController();
  Future<void> _setPin() async {
    final pin = _pinController.text.trim();
    if (pin.length < 4) {
      setState(() => _pinStatus = 'PIN must be at least 4 digits');
      return;
    }
    await PinService.setPin(pin);
    setState(() => _pinStatus = 'PIN set successfully');
    _pinController.clear();
  }

  Future<void> _verifyPin() async {
    final pin = _verifyPinController.text.trim();
    final ok = await PinService.verifyPin(pin);
    setState(() => _pinStatus = ok ? 'PIN verified!' : 'Incorrect PIN');
    _verifyPinController.clear();
  }

  Future<void> _clearPin() async {
    await PinService.clearPin();
    setState(() => _pinStatus = 'PIN cleared');
  }

  int _autoLockMinutes = 5;
  final _storage = const FlutterSecureStorage();
  static const _autoLockKey = 'auto_lock_minutes';
  final List<Map<String, dynamic>> _autoLockOptions = [
    {'label': 'Immediately', 'value': 0},
    {'label': '3 minutes', 'value': 3},
    {'label': '5 minutes', 'value': 5},
    {'label': '60 minutes', 'value': 60},
  ];

  @override
  void initState() {
    super.initState();
    _loadAutoLockPref();
  }

  Future<void> _loadAutoLockPref() async {
    final val = await _storage.read(key: _autoLockKey);
    if (val != null) {
      setState(() => _autoLockMinutes = int.tryParse(val) ?? 5);
    }
  }

  Future<void> _setAutoLockPref(int minutes) async {
    await _storage.write(key: _autoLockKey, value: minutes.toString());
    setState(() => _autoLockMinutes = minutes);
  }

  final LocalAuthentication auth = LocalAuthentication();
  String? _biometricStatus;

  Future<void> _checkBiometrics() async {
    try {
      final canCheck = await auth.canCheckBiometrics;
      final available = await auth.getAvailableBiometrics();
      setState(() {
        _biometricStatus =
            canCheck
                ? 'Available: ${available.join(", ")}'
                : 'No biometrics available';
      });
    } catch (e) {
      setState(() {
        _biometricStatus = 'Error: ${e.toString()}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings & Security')),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          SwitchListTile(
            title: const Text('Enable Biometrics'),
            value: _biometricsEnabled,
            onChanged: (val) async {
              setState(() => _biometricsEnabled = val);
              await _storage.write(
                key: 'biometrics_enabled',
                value: val.toString(),
              );
              if (val) await _checkBiometrics();
            },
          ),
          if (_biometricStatus != null)
            Padding(
              padding: const EdgeInsets.only(left: 16, bottom: 8),
              child: Text(_biometricStatus!),
            ),
          SwitchListTile(
            title: const Text('Enable PIN'),
            value: _pinEnabled,
            onChanged: (val) async {
              setState(() => _pinEnabled = val);
              await _storage.write(key: 'pin_enabled', value: val.toString());
            },
          ),
          if (_pinEnabled) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: TextField(
                controller: _pinController,
                obscureText: true,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Set PIN'),
              ),
            ),
            ElevatedButton(onPressed: _setPin, child: const Text('Set PIN')),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: TextField(
                controller: _verifyPinController,
                obscureText: true,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Verify PIN'),
              ),
            ),
            ElevatedButton(
              onPressed: _verifyPin,
              child: const Text('Verify PIN'),
            ),
            ElevatedButton(
              onPressed: _clearPin,
              child: const Text('Clear PIN'),
            ),
            if (_pinStatus != null)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Text(
                  _pinStatus!,
                  style: const TextStyle(color: Colors.blue),
                ),
              ),
          ],
          ListTile(
            title: const Text('Auto-lock Timer'),
            trailing: DropdownButton<int>(
              value: _autoLockMinutes,
              items:
                  _autoLockOptions
                      .map(
                        (opt) => DropdownMenuItem<int>(
                          value: opt['value'],
                          child: Text(opt['label']),
                        ),
                      )
                      .toList(),
              onChanged: (val) {
                if (val != null) _setAutoLockPref(val);
              },
            ),
          ),
        ],
      ),
    );
  }
}
