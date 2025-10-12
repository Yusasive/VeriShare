import 'package:flutter/material.dart';
import '../services/pin_service.dart';
import 'package:local_auth/local_auth.dart';

class LockScreen extends StatefulWidget {
  final bool biometricsEnabled;
  final bool pinEnabled;
  final VoidCallback? onUnlocked;
  const LockScreen({
    super.key,
    this.biometricsEnabled = false,
    this.pinEnabled = false,
    this.onUnlocked,
  });

  @override
  State<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends State<LockScreen> {
  final TextEditingController _pinController = TextEditingController();
  String? _status;
  final LocalAuthentication auth = LocalAuthentication();

  @override
  void initState() {
    super.initState();
    if (widget.biometricsEnabled) {
      _tryBiometrics();
    }
  }

  Future<void> _tryBiometrics() async {
    try {
      final didAuth = await auth.authenticate(
        localizedReason: 'Unlock VeriShare',
        options: const AuthenticationOptions(biometricOnly: true),
      );
      if (!mounted) return;
      if (didAuth) {
        _notifyUnlocked();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _status = 'Biometric error: ${e.toString()}');
    }
  }

  Future<void> _verifyPin() async {
    final pin = _pinController.text.trim();
    final ok = await PinService.verifyPin(pin);
    if (!mounted) return;
    if (ok) {
      _notifyUnlocked();
    } else {
      setState(() => _status = 'Incorrect PIN');
    }
    _pinController.clear();
  }

  void _notifyUnlocked() {
    if (widget.onUnlocked != null) {
      widget.onUnlocked!();
    } else {
      Navigator.of(context).maybePop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock, size: 64, color: Colors.blue),
              const SizedBox(height: 24),
              const Text(
                'App Locked',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              if (widget.pinEnabled) ...[
                const SizedBox(height: 24),
                TextField(
                  controller: _pinController,
                  obscureText: true,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Enter PIN'),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: _verifyPin,
                  child: const Text('Unlock'),
                ),
              ],
              if (_status != null) ...[
                const SizedBox(height: 16),
                Text(_status!, style: const TextStyle(color: Colors.red)),
              ],
              if (widget.biometricsEnabled) ...[
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _tryBiometrics,
                  child: const Text('Use Biometrics'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
