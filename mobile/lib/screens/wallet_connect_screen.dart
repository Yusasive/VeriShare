import 'package:flutter/material.dart';
// import '../services/metamask_service.dart';
import 'dart:math';
import 'app_shell.dart'; // Correct import for AppShell

class WalletConnectScreen extends StatefulWidget {
  final VoidCallback? onConnected;
  const WalletConnectScreen({super.key, this.onConnected});

  @override
  State<WalletConnectScreen> createState() => _WalletConnectScreenState();
}

class _WalletConnectScreenState extends State<WalletConnectScreen>
    with TickerProviderStateMixin {
  String? _error;
  String? walletConnectUri;
  // MetaMask is not available on mobile
  String? _metaMaskAccount;
  bool _isLoading = false;
  bool _isMetaMaskAvailable = false;
  late AnimationController _bgController;

  @override
  void initState() {
    super.initState();
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
    // MetaMask is not available on mobile
    setState(() {
      _isMetaMaskAvailable = false;
      _error = 'MetaMask is only available on web.';
    });
  }

  @override
  void dispose() {
    _bgController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          AnimatedBuilder(
            animation: _bgController,
            builder: (context, child) {
              return CustomPaint(
                painter: _Web3WalletConnectBackgroundPainter(
                  _bgController.value,
                ),
                child: Container(),
              );
            },
          ),
          Center(
            child: Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.purpleAccent.withOpacity(0.18),
                    Colors.pinkAccent.withOpacity(0.18),
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.account_balance_wallet,
                    size: 60,
                    color: Colors.purpleAccent,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'MetaMask wallet connect is only available on web.',
                    style: const TextStyle(color: Colors.white, fontSize: 18),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// CustomPainter for animated background
class _Web3WalletConnectBackgroundPainter extends CustomPainter {
  final double animationValue;
  _Web3WalletConnectBackgroundPainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final bg =
        Paint()
          ..shader = LinearGradient(
            colors: [
              Colors.black,
              Colors.purpleAccent.withValues(alpha: 0.12),
              Colors.pinkAccent.withValues(alpha: 0.12),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bg);

    // Add animated floating particles
    final particlePaint =
        Paint()
          ..color = Colors.purpleAccent.withValues(alpha: 0.09)
          ..style = PaintingStyle.fill;
    for (int i = 0; i < 16; i++) {
      final angle = animationValue * 2 * pi + i * pi / 8;
      final radius = size.width * 0.46 + 30 * sin(animationValue * 2 * pi + i);
      final offset = Offset(
        size.width / 2 + radius * cos(angle),
        size.height / 2 + radius * sin(angle),
      );
      canvas.drawCircle(offset, 6, particlePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
