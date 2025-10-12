import 'dart:async';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'screens/lock_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/onboarding_screen.dart';
import 'screens/wallet_connect_screen.dart';
import 'screens/app_shell.dart';
import 'services/navigation_service.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  final _storage = const FlutterSecureStorage();
  bool _locked = false;
  Timer? _lockTimer;
  bool _biometricsEnabled = false;
  bool _pinEnabled = false;
  int _autoLockMinutes = 5;

  @override
  void initState() {
    super.initState();
    navigatorKey = GlobalKey<NavigatorState>();
    WidgetsBinding.instance.addObserver(this);
    _loadPrefs();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _lockTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadPrefs() async {
    final bio = await _storage.read(key: 'biometrics_enabled');
    final pin = await _storage.read(key: 'pin_enabled');
    final auto = await _storage.read(key: 'auto_lock_minutes');
    setState(() {
      _biometricsEnabled = bio == 'true';
      _pinEnabled = pin == 'true';
      _autoLockMinutes = int.tryParse(auto ?? '5') ?? 5;
    });
  }

  void _startLockTimer() {
    _lockTimer?.cancel();
    if (_autoLockMinutes == 0) {
      _lock();
    } else {
      _lockTimer = Timer(Duration(minutes: _autoLockMinutes), _lock);
    }
  }

  void _lock() {
    if (!_locked && (_biometricsEnabled || _pinEnabled)) {
      setState(() => _locked = true);
    }
  }

  Future<Widget> _getInitialScreen() async {
    final hasOnboarded = await NavigationService.hasCompletedOnboarding();
    final hasWallet = await NavigationService.hasWallet();

    if (!hasOnboarded) {
      return OnboardingScreen(
        onFinished: () async {
          await NavigationService.setOnboardingCompleted();
          navigatorKey.currentState?.pushReplacement(
            MaterialPageRoute(builder: (context) => WalletConnectScreen()),
          );
        },
      );
    }

    if (!hasWallet) {
      return WalletConnectScreen();
    }

    return const AppShell();
  }

  late final GlobalKey<NavigatorState> navigatorKey;

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused) {
      _startLockTimer();
    } else if (state == AppLifecycleState.resumed) {
      if (_locked) {
        // Already locked, do nothing
      } else if (_autoLockMinutes == 0) {
        _lock();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
    );
    return MaterialApp(
      title: 'VeriShare',
      theme: AppTheme.darkTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      debugShowCheckedModeBanner: false,
      home: FutureBuilder<Widget>(
        future: _getInitialScreen(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              backgroundColor: AppTheme.backgroundDark,
              body: Center(
                child: CircularProgressIndicator(color: AppTheme.accentCyan),
              ),
            );
          }
          return snapshot.data ?? const OnboardingScreen();
        },
      ),
      navigatorKey: navigatorKey,
      builder: (context, child) {
        if (_locked) {
          return LockScreen(
            biometricsEnabled: _biometricsEnabled,
            pinEnabled: _pinEnabled,
            key: const ValueKey('lock'),
          );
        }
        return child!;
      },
    );
  }
}
